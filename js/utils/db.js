import {openDB} from "idb";

export class IndexedDB {
    #db = null;

    constructor(db) {
        this.#db = db;
    }

    static async open(name, version, updated) {
        if (!('indexedDB' in window)) {
            throw new Error('IndexedDB не поддерживается браузером');
        }

        const db = await openDB(name, version, {
            upgrade(db, oldVersion, newVersion) {
                if (updated) {
                    updated(db, oldVersion, newVersion);
                }
            }
        });

        return new IndexedDB(db);
    }

    get(collection, key) {
        this.#initializationDB();

        return this.#db.get(collection, key);
    }

    getAll(collection) {
        this.#initializationDB();

        return this.#db.getAll(collection);
    }

    put(collection, key, value) {
        this.#initializationDB();

        if (key !== undefined) {
            this.#db.put(collection, key, value);
        } else {
            this.#db.put(collection, value);
        }
    }

    #initializationDB() {
        if (!this.#db) {
            throw new Error('База данных не инициализирована');
        }
    }
}