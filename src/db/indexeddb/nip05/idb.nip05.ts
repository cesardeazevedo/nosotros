import type { Nip05DB } from '@/db/types'
import type * as idb from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'

export class IDBNip05 {
  constructor(private db: Promise<idb.IDBPDatabase<IndexedDBSchema>>) {}

  async query(nip05: string) {
    const db = await this.db
    return await db.get('nip05', nip05)
  }

  async insert(data: Nip05DB) {
    try {
      const db = await this.db
      await db.put('nip05', data)
      return data
    } catch (error) {
      console.log(error)
      return data
    }
  }
}
