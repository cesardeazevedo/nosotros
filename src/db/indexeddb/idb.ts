import type { DB } from 'db/types'
import type * as idb from 'idb'
import { IDBEventStore } from './events/idb.events'
import { buildDB } from './idb.builder'
import { schemas, type IndexedDBSchema } from './idb.schemas'
import { IDBMetadata } from './metadata/idb.metadata'
import { IDBRelayStats } from './relayStats/idb.relayStats'
import { IDBSeenStore } from './seen/idb.seen'

const DB_VERSION = 11

export class IDBStorage implements DB {
  db: Promise<idb.IDBPDatabase<IndexedDBSchema>>

  seen: IDBSeenStore
  event: IDBEventStore
  relayStats: IDBRelayStats
  metadata: IDBMetadata

  constructor(name: string) {
    this.db = buildDB(name, DB_VERSION, schemas)

    this.seen = new IDBSeenStore(this.db)
    this.event = new IDBEventStore(this.db)
    this.relayStats = new IDBRelayStats(this.db)
    this.metadata = new IDBMetadata(this.db)
  }

  async clearDB() {
    const db = await this.db
    for (const name of db.objectStoreNames) {
      await db.clear(name)
    }
  }
}
