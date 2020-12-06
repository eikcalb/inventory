import { Application } from ".";
import { log } from "..";
import { db, storageRef } from "./firebase";
const { v4 } = window.require("uuid")

export interface IProduct {
    id: string
    name: string
    description: string
    quantity: number
    price: number
    dateAdded: number
    cloudPhotoURL?: string
    localPhotoURL?: string
}

export class Product {
    static productsRef = db.collection('products')

    protected static async uploadImage(file: File) {
        const name = v4()
        const uploadTask = await storageRef.child(`products/${name}`).put(file, { contentType: file.type, })
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
            upload = await Product.uploadImage(data.image)
            const product: IProduct = {
                id: doc.id,
                dateAdded: Date.now(),
                description: data.description,
                name: data.name,
                price: data.price,
                quantity: data.quantity,
                cloudPhotoURL: await upload.getDownloadURL()
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