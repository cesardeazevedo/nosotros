import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { RelayInfoDB } from '@/db/types'
import type * as idb from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'

export class IDBRelayInfo {
  constructor(private db: Promise<idb.IDBPDatabase<IndexedDBSchema>>) {}

  async query(url: string) {
    const db = await this.db
    return await db.get('relayInfo', formatRelayUrl(url))
  }

  async queryAll() {
    const db = await this.db
    return await db.getAll('relayInfo')
  }

  async insert(url: string, info: Omit<RelayInfoDB, 'url' | 'timestamp'>) {
    const db = await this.db
    const data = { ...info, url: formatRelayUrl(url), timestamp: Date.now() }
    await db.put('relayInfo', data)
    return data
  }
}
