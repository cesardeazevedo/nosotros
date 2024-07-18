import type { NostrEvent, NostrFilter } from 'core/types'
import type { SeenDB, Storage, UserRelayDB } from 'db/types'
import type * as idb from 'idb'
import { IDBEventStore } from './events/idb.events'
import { buildDB } from './idb.builder'
import { schemas, type IndexedDBSchema } from './idb.schemas'
import { IDBSeenStore } from './seen/idb.seen'
import { IDBUserRelayStore } from './userRelays/idb.userRelays'

const DB_VERSION = 10

class IDBStorage implements Storage {
  db: Promise<idb.IDBPDatabase<IndexedDBSchema>>

  seen: IDBSeenStore
  event: IDBEventStore
  userRelay: IDBUserRelayStore

  constructor(name: string) {
    this.db = buildDB(name, DB_VERSION, schemas)

    this.seen = new IDBSeenStore(this.db)
    this.event = new IDBEventStore(this.db)
    this.userRelay = new IDBUserRelayStore(this.db)
  }

  // Events
  async *query(filters: NostrFilter | NostrFilter[]) {
    yield* this.event.query(filters)
  }
  async queryEventByPubkey(kind: number, pubkey: string) {
    return await this.event.queryEventByPubkey(kind, pubkey)
  }
  async insert(event: NostrEvent) {
    return await this.event.insert(event)
  }

  // Seen
  async querySeen(eventId: string) {
    return await this.seen.query(eventId)
  }
  async insertSeenBulk(seens: SeenDB[]) {
    return await this.seen.insertBulk(seens)
  }

  // UserRelay
  async queryUserRelay(pubkey: string) {
    return await this.userRelay.query(pubkey)
  }
  async insertUserRelayBulk(data: UserRelayDB[]) {
    return await this.userRelay.insert(data)
  }

  async clearDB() {
    const db = await this.db
    for (const name of db.objectStoreNames) {
      await db.clear(name)
    }
  }
}

export default IDBStorage
