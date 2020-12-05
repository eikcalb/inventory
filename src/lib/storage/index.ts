import { IConfig } from ".."
import localforage from 'localforage'
import firebase from 'firebase'
import { User } from "../user"

export abstract class Storage {
    config: IConfig

    constructor(config: IConfig) {
        this.config = config
        // localforage will store siumple data required by the application
        localforage.config({
            description: 'app data storage for application.',
            driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
            name: 'App Data',
            size: Number.POSITIVE_INFINITY,
            storeName: 'Inventory App Data',
            version: 1
        })
    }
    
    async saveProduct() {

    }
}



export class BaseStorage extends Storage {

}