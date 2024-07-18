import * as idb from 'idb'
import type { IndexedDBSchema, Schemas } from './idb.schemas'

export async function buildDB(
  name: string,
  version: number,
  schemas: Schemas,
): Promise<idb.IDBPDatabase<IndexedDBSchema>> {
  return await idb.openDB<IndexedDBSchema>(name, version, {
    upgrade: (db, _oldVersion, _newVersion, transaction) => {
      Object.values(schemas).forEach(({ name, keyPath = 'id', indexes = [] }) => {
        const store = !db.objectStoreNames.contains(name)
          ? db.createObjectStore(name, { keyPath })
          : transaction.objectStore(name)

        for (const indexDef of indexes) {
          const indexName = ('name' in indexDef ? indexDef.name : indexDef.keyPath) as never
          if (!store.indexNames.contains(indexName)) {
            store.createIndex(indexName, indexDef.keyPath as never)
          }
        }
      })
    },
  })
}
