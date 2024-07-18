import type { UserRelayDB } from 'db/types'
import type * as idb from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'

export class IDBUserRelayStore {
  constructor(private db: Promise<idb.IDBPDatabase<IndexedDBSchema>>) {}

  async query(pubkey: string) {
    const db = await this.db
    return await db.getAllFromIndex('userRelays', 'pubkey', pubkey)
  }

  async insert(data: UserRelayDB[]) {
    const db = await this.db
    const tx = db.transaction('userRelays', 'readwrite')
    await Promise.all(data.map((userRelay) => tx.store.put(userRelay)))
    await tx.done
  }
}
