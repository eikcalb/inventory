const DataStore = window.require("nedb")
const { remote } = window.require("electron")
const { join, resolve } = window.require("path");

const databases: {
    product: typeof DataStore | null,
    transaction: typeof DataStore | null,
    app: typeof DataStore | null
} = {
    product: null,
    transaction: null,
    app: null
}

export const PRODUCT_IMAGES_PATH = join(remote.app.getPath('appData'), remote.app.name, 'images')
export const getProductImagePath = (id: string) => resolve(join(PRODUCT_IMAGES_PATH, id))


export const getProductDB = async () => {
    if (!databases.product) {
        const { app } = remote
        databases.product = new DataStore({
            filename: join(app.getPath('appData'), app.name, 'products.db'),
            autoload: true,
        })
    }
    return databases.product
}
export const getTransactionDB = async () => {
    if (!databases.transaction) {
        const { app } = remote
        databases.transaction = new DataStore({
            filename: join(app.getPath('appData'), app.name, 'transactions.db'),
            autoload: true,
        })
    }
    return databases.transaction
}

export const getAppDB = async () => {
    if (!databases.app) {
        const { app } = remote
        databases.app = new DataStore({
            filename: join(app.getPath('appData'), app.name, 'app.db'),
            autoload: true,
        })
    }
    return databases.app
}