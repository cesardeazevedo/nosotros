import { IDBStorage } from 'db/indexeddb/idb'

const DB_NAME = import.meta.env.VITE_DB_NAME

export const db = new IDBStorage(DB_NAME)
