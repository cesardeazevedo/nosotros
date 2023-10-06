import { IDBPDatabase, IDBPObjectStore } from 'idb'
import * as idb from 'idb/with-async-ittr'

type Schema = {
  indexes: string[]
  keyPath: string
}

class Database {
  db: IDBPDatabase | undefined

  getDB: Promise<IDBPDatabase>
  private _resolver!: (value: IDBPDatabase) => void

  version = 2
  schemas = new Map<string, Schema>()

  constructor() {
    this.getDB = new Promise<IDBPDatabase>((resolve) => {
      this._resolver = resolve
    })
  }

  async initialize() {
    this.db = await idb.openDB(process.env.APP_NAME + 'DB', this.version, {
      upgrade: (db, oldVersion, newVersion, transaction) => {
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

  async clear() {
    const db = await this.getDB
    for (const name of db.objectStoreNames) {
      const tx = db.transaction(name, 'readwrite')
      const store = tx.objectStore(name)
      await store.clear()
      await tx.done
    }
  }
}

export const database = new Database()
