import type * as idb from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'

export class IDBStats {
  constructor(private db: Promise<idb.IDBPDatabase<IndexedDBSchema>>) {}

  async countEvents() {
    const db = await this.db
    return await db.count('events')
  }

  async countTags() {
    const db = await this.db
    return await db.count('tags')
  }
}
