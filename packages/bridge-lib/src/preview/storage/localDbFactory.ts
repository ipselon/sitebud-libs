import type {IDBPDatabase} from 'idb';
import {openDB} from 'idb';
let dbPromise: any | undefined;

export function getIdb() {
    if (!dbPromise) {
        // const openDBFunc: any = (window as any).__idb.openDB;
        dbPromise = openDB('CMS_CACHE_DB', 1, {
            upgrade(db: IDBPDatabase) {
                db.createObjectStore('cache');
            },
        });
    }
    return dbPromise;
}
