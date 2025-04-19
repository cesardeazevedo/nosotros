import type * as idb from 'idb'
import type { IndexedDBSchema } from './idb.schemas'

type StoreNames = 'events' | 'tags' | 'metadata' | 'seen' | 'relayInfo' | 'relayStats' | 'nip05'
type IDBStore = idb.IDBPObjectStore<IndexedDBSchema, ArrayLike<StoreNames>, StoreNames, 'versionchange'>

function deleteObjectStore(db: idb.IDBPDatabase<IndexedDBSchema>, name: string) {
  if (db.objectStoreNames.contains(name as never)) {
    db.deleteObjectStore(name as never)
  }
}

function deleteIndex(db: IDBStore, name: string) {
  if (db.indexNames.contains(name as never)) {
    db.deleteIndex(name)
  }
}

export function migrate(
  db: idb.IDBPDatabase<IndexedDBSchema>,
  transaction: idb.IDBPTransaction<IndexedDBSchema, ArrayLike<StoreNames>, 'versionchange'>,
  oldVersion: number,
) {
  if (oldVersion <= 10) {
    const events = transaction.objectStore('events')
    const tags = transaction.objectStore('tags')

    deleteObjectStore(db, 'userRelays')
    deleteIndex(events as IDBStore, 'kind')
    deleteIndex(events as IDBStore, 'pubkey')
    deleteIndex(events as IDBStore, 'kind_pubkey')
    deleteIndex(events as IDBStore, 'kind_created_at')
    deleteIndex(tags as IDBStore, 'kind_tag_value')
  }
  if (oldVersion <= 12) {
    // recreate table as it was created with wrong keyPath
    deleteObjectStore(db, 'relayInfo')
    db.createObjectStore('relayInfo', { keyPath: 'url' })
  }
}
