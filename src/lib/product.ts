import { Application } from ".";
import { log } from "..";
import { getProductImagePath } from "./database";
import { db, storageRef } from "./firebase";

const { get } = window.require("https")
const { access, constants, createWriteStream, unlinkSync } = window.require("fs")
const { v4 } = window.require("uuid")

type ListenerPropAction = (doc: IProduct) => any

export const CurrencyFormatter = Intl.NumberFormat('en-US', { currency: 'NGN', minimumFractionDigits: 2 })

export interface IProduct {
    id: string
    name: string
    description: string
    quantity: number
    price: number
    dateAdded: number
    cloudPhotoURL?: string
    localPhotoURL?: string
    localOnly?: boolean
    initiator?: string
}

export class Product {
    static productsRef = db.collection('products')
    static transactionsRef = db.collection('transactions')

    protected static async uploadImage(file: File, id: string) {
        // const id = v4()
        const uploadTask = await storageRef.child(`products/${id}`).put(file, { contentType: file.type, })
        return uploadTask.ref
    }

    static async addProduct(app: Application, data: { image: File, name: string, description: string, price: any, quantity: any }) {
        // TODO: check if computer is connected to the Internet

        // Check if product already exists
        let upload
        try {
            if (!data || !data.name || !data.description || !data.price || !data.quantity || !data.image) {
                throw new Error('Please provide required data!')
            }

            const existing = await Product.getProductByName(app, data.name)
            if (existing && existing.length > 0) {
                throw new Error("Product already exists! Change the product name to continue or edit the existing product!")
            }
            const doc = Product.productsRef.doc()
            upload = await Product.uploadImage(data.image, doc.id)
            const product: IProduct = {
                id: doc.id,
                dateAdded: Date.now(),
                description: data.description,
                name: data.name.toLowerCase(),
                price: data.price,
                quantity: data.quantity,
                cloudPhotoURL: await upload.getDownloadURL(),
                initiator: app.user!.username
            }
            await doc.set(product)
            return product
        } catch (e) {
            log.error('Product add error: ', e)
            if (upload) {
                upload.delete()
            }
            switch (e.code) {
                case 'storage/unauthorized':
                    throw new Error('You are not authorized to save images')
                case 'storage/retry-limit-exceeded':
                    // In future, you might want to modify this to save file locally before retrying.
                    throw new Error('Failed to upload product! Confirm you have a working network!')
                case 'storage/canceled':
                case 'storage/unknown':
                default:
                    throw e
            }
        }
    }

    static async updateProductValue(app: Application, item: IProduct, update: { price: number, quantity: number }) {
        try {
            if (!item || !item.name || !update.price || !update.quantity) {
                throw new Error('Invalid operation!')
            }

            if (item.price === update.price && item.quantity === update.quantity) {
                throw new Error('No update to save!')
            }
            const doc = Product.productsRef.doc(item.id)
            await db.runTransaction(async (t) => {
                const newTxn = Product.transactionsRef.doc()
                t.update(doc, {
                    price: update.price,
                    quantity: update.quantity
                }).set(newTxn, {
                    id: newTxn.id,
                    initiator: app.user!.username,
                    updates: [{
                        id: doc.id,
                        data: {
                            price: update.price,
                            quantity: update.quantity
                        }
                    }]
                })

                return Promise.resolve()
            })

            return { ...item, ...update }
        } catch (e) {
            log.error('Product update error: ', e)
            throw e
        }
    }

    static async removeProduct(product: IProduct) {
        try {
            if (!product || !product.id) {
                throw new Error('Invalid product specified!')
            }

            await storageRef.child(`products/${product.id}`).delete()
            await Product.productsRef.doc(product.id).delete()

            unlinkSync(getProductImagePath(product.id))

            return true
        } catch (e) {
            log.error('Product delete error: ', e)
            switch (e.code) {
                case 'storage/unauthorized':
                    throw new Error('You are not authorized to save images')
                case 'storage/retry-limit-exceeded':
                    // In future, you might want to modify this to save file locally before retrying.
                    throw new Error('Failed to upload product! Confirm you have a working network!')
                case 'storage/canceled':
                case 'storage/unknown':
                default:
                    throw e
            }
        }
    }

    static getProducts(callback: { add: ListenerPropAction, remove: ListenerPropAction, change: ListenerPropAction }) {
        return Product.productsRef.orderBy('name', 'asc').onSnapshot(async (docs) => {
            docs.docChanges().forEach(async ({ type, doc }) => {
                let changeType: string
                switch (type) {
                    case 'added':
                        changeType = 'add'
                        break
                    case 'removed':
                        changeType = 'remove'
                        break
                    case 'modified':
                        changeType = 'change'
                        break
                }

                const data = doc.data()
                let localPhotoURL = getProductImagePath(data.id)
                const exists = await new Promise((res) => access(localPhotoURL, constants.F_OK | constants.R_OK, (err: any) => {
                    if (err) {
                        return res(false)
                    }
                    res(true)
                }))

                // If photo does not exist locally, download it
                if (!exists) {
                    try {
                        await new Promise((res, rej) => {
                            const wStream = createWriteStream(localPhotoURL, { autoClose: true })
                            get(data.cloudPhotoURL, (resp: any) => {
                                resp.pipe(wStream)
                                resp.on('close', res)
                                resp.on('error', (e: Error) => {
                                    rej(e)
                                })
                            })
                        })
                    } catch (e) {
                        // Silently fail if image failed to download.
                        // On next load, the download will be retried.
                        log.info(`${data.name} (${data.id}) image failed to download: `, e)
                        localPhotoURL = data.cloudPhotoURL
                    }
                }

                //@ts-ignore
                return callback[changeType]({
                    id: data.id,
                    dateAdded: data.dateAdded,
                    description: data.description,
                    name: data.name,
                    price: data.price,
                    quantity: data.quantity,
                    cloudPhotoURL: data.cloudPhotoURL,
                    localOnly: doc.metadata.hasPendingWrites,
                    localPhotoURL
                })

            })
        })
    }

    static async getProductByID(app: Application, id: string) {

    }

    static async getProductByName(app: Application, name: string) {
        try {
            const snap = await Product.productsRef.where('name', '==', name.trim()).get()
            if (snap.empty) {
                return null
            }

            return snap.docs
        } catch (e) {
            console.log(e)
            throw e
        }
    }

}