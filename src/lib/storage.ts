export class Storage {
    core: IStorage

    constructor(app: IStorage) {
        this.core = app
    }

    async saveProduct(){
        
    }
}

export interface IStorage {
    save(): boolean
}