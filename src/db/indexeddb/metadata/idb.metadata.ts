import type { MetadataDB } from '@/db/types'
import type * as idb from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'

export class IDBMetadata {
  constructor(private db: Promise<idb.IDBPDatabase<IndexedDBSchema>>) {}

  async query<T extends MetadataDB>(id: string): Promise<T | undefined> {
    const db = await this.db
    return (await db.get('metadata', id)) as T | undefined
  }

  async insert<T extends MetadataDB>(data: T) {
    const db = await this.db
    await db.put('metadata', {
      ...data,
      insertedAt: Date.now(),
    })
    return data
  }
}
