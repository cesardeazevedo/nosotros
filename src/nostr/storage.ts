import IDBStorage from "db/indexeddb/idb"
import type { Storage } from "db/types"

const DB_NAME = import.meta.env.VITE_DB_NAME

export const storage = new IDBStorage(DB_NAME) as Storage
