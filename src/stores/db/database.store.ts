import * as idb from 'idb'
import { IDBPDatabase, IDBPObjectStore } from 'idb'

type Schema = {
  indexes: string[]
  keyPath: string
}

class Database {
  db: IDBPDatabase | undefined

  getDB: Promise<IDBPDatabase>
  private _resolver!: (value: IDBPDatabase) => void

  version = 6
  schemas = new Map<string, Schema>()

  constructor() {
    this.getDB = new Promise<IDBPDatabase>((resolve) => {
      this._resolver = resolve
    })
  }

  async initialize() {
    this.db = await idb.openDB(import.meta.env.VITE_DB_NAME, this.version, {
      upgrade: async (db, oldVersion, newVersion, transaction) => {
        this.schemas.forEach((schema, name) => {
          let store: IDBPObjectStore<unknown, string[], string, 'versionchange'>
          if (!db.objectStoreNames.contains(name)) {
            store = db.createObjectStore(name, { keyPath: schema.keyPath })
          } else {
            store = transaction.objectStore(name)
          }

          // Create indexes based on the provided definitions
          for (const indexDef of [...schema.indexes, 'inserted_at']) {
            if (!store.indexNames.contains(indexDef as string)) {
              store.createIndex(indexDef as string, indexDef as string)
            }
          }
        })
      },
    })
    this._resolver(this.db)
    return this.db
  }

  // for tests only
  async clear() {
    const db = await this.getDB
    for (const name of db.objectStoreNames) {
      await db.clear(name)
    }
  }
}

export const database = new Database()
