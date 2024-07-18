import type { Kind } from 'constants/kinds'
import { isReplaceable } from 'core/helpers'
import type { NostrEvent, NostrFilter } from 'core/types'
import type { EventDB } from 'db/types'
import type * as idb from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'
import IDBEventQuery from './idb.events.query'

export class IDBEventStore {
  constructor(private db: Promise<idb.IDBPDatabase<IndexedDBSchema>>) {}

  async *query(filters: NostrFilter | NostrFilter[]) {
    const db = await this.db
    yield* [filters].flat().map((filter) => new IDBEventQuery(db, filter).start())
  }

  async queryEventByPubkey(kind: Kind, pubkey: string) {
    const db = await this.db
    return await db.getFromIndex('events', 'kind_pubkey', IDBKeyRange.only([kind, pubkey]))
  }

  async insert(data: NostrEvent) {
    const db = await this.db
    const tx = db.transaction(['events', 'tags'], 'readwrite')
    const events = tx.objectStore('events')
    const tags = tx.objectStore('tags')

    const replaceable = isReplaceable(data.kind)

    if (replaceable) {
      const index = events.index('kind_pubkey')
      const eventFound = await index.get(IDBKeyRange.only([data.kind, data.pubkey]))
      const latestDate = eventFound?.created_at || 0

      if (data.created_at > latestDate) {
        if (eventFound) {
          await Promise.all([events.delete(eventFound.id), tags.delete(IDBKeyRange.lowerBound([eventFound.id]))])
        }
      } else {
        return false
      }
    }

    await events.put(data as EventDB)

    await Promise.all(
      data.tags.map((tag, index) => {
        return tags.put({
          index,
          kind: data.kind,
          eventId: data.id,
          pubkey: data.pubkey,
          tag: tag[0],
          value: tag[1],
          extras: tag.slice(2),
        })
      }),
    )
    await tx.done
    return data
  }
}
