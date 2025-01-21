import type { SeenDB } from 'db/types'
import type * as idb from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'

export class IDBSeenStore {
  constructor(private db: Promise<idb.IDBPDatabase<IndexedDBSchema>>) {}

  async query(eventId: string) {
    return (await this.db).getAllFromIndex('seen', 'eventId', eventId)
  }

  async countByRelay(relay: string) {
    const db = await this.db
    return await db.countFromIndex('seen', 'relay', relay)
  }

  async insertBulk(seens: SeenDB[]) {
    const tx = (await this.db).transaction('seen', 'readwrite')
    await Promise.all(seens.map((seen) => tx.store.put(seen)))
    await tx.done
  }
}
