import type { RelayStatsDB } from '@/db/types'
import type * as idb from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'

export class IDBRelayStats {
  constructor(private db: Promise<idb.IDBPDatabase<IndexedDBSchema>>) {}

  async query(url: string) {
    const db = await this.db
    return await db.get('relayStats', url)
  }

  async queryAll() {
    const db = await this.db
    return await db.getAll('relayStats')
  }

  async insert(data: RelayStatsDB) {
    const db = await this.db
    await db.put('relayStats', data)
    return data
  }
}
