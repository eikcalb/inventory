import DataStore from "nedb";
import { remote } from "electron";
import { join } from "path";

const databases: {
    product: DataStore | null,
    transaction: DataStore | null
} = {
    product: null,
    transaction: null
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