const DataStore = window.require("nedb")
const { remote } = window.require("electron")
const { join } = window.require("path");

const databases: {
    product: typeof DataStore | null,
    transaction: typeof DataStore | null,
    app: typeof DataStore | null
} = {
    product: null,
    transaction: null,
    app: null
}

export const getProductDB = async () => {
    if (!databases.product) {
        const { app } = remote
        databases.product = new DataStore({
            filename: join(app.getPath('appData'), 'products.db'),
            autoload: true,
        })
    }
    return databases.product
}
export const getTransactionDB = async () => {
    if (!databases.transaction) {
        const { app } = remote
        databases.transaction = new DataStore({
            filename: join(app.getPath('appData'), 'transactions.db'),
            autoload: true,
        })
    }
    return databases.transaction
}

export const getAppDB = async () => {
    if (!databases.app) {
        const { app } = remote
        databases.app = new DataStore({
            filename: join(app.getPath('appData'), 'app.db'),
            autoload: true,
        })
    }
    return databases.app
}