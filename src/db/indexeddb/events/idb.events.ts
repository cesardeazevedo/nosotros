import type { Kind } from 'constants/kinds'
import type { NostrEvent, NostrFilter } from 'core/types'
import type * as idb from 'idb'
import { isAddressableKind, isReplaceableKind } from 'nostr-tools/kinds'
import type { IndexedDBSchema } from '../idb.schemas'
import { IDBEventQuery } from './idb.events.query'

export class IDBEventStore {
  constructor(private db: Promise<idb.IDBPDatabase<IndexedDBSchema>>) {}

  async *query(filter: NostrFilter) {
    const db = await this.db
    yield* new IDBEventQuery(db, filter).start()
  }

  async queryByPubkey(kind: Kind, pubkey: string) {
    const db = await this.db
    return await db.getFromIndex(
      'events',
      'kind_pubkey_created_at',
      IDBKeyRange.bound([kind, pubkey, 0], [kind, pubkey, Infinity]),
    )
  }

  async countTags(kind: Kind, tag: string, value: string, created_at?: number) {
    const db = await this.db
    const key = IDBKeyRange.bound([kind, tag, value, created_at || 0], [kind, tag, value, created_at || Infinity])
    return await db.countFromIndex('tags', 'kind_tag_value_created_at', key)
  }

  async insertBatch(data: NostrEvent[]) {
    const db = await this.db
    const tx = db.transaction(['events', 'tags'], 'readwrite')
    const events = tx.objectStore('events')
    const tags = tx.objectStore('tags')
    const operations = data
      .map((event) => [
        events.put(event),
        ...event.tags
          .filter((tags) => tags.length > 1 && tags[0].length === 1)
          .map((tag, index) => {
            return tags.put({
              index,
              kind: event.kind,
              eventId: event.id,
              pubkey: event.pubkey,
              created_at: event.created_at,
              tag: tag[0],
              value: tag[1],
              extras: tag.slice(2),
            })
          }),
      ])
      .flat()
    await Promise.all(operations)
    await tx.done
  }

  async insert(data: NostrEvent) {
    const db = await this.db
    const tx = db.transaction(['events', 'tags'], 'readwrite')
    const events = tx.objectStore('events')
    const tags = tx.objectStore('tags')

    const isReplaceable = isReplaceableKind(data.kind)

    if (isReplaceable) {
      const index = events.index('kind_pubkey_created_at')
      const eventFound = await index.get(
        IDBKeyRange.bound([data.kind, data.pubkey, 0], [data.kind, data.pubkey, Infinity]),
      )
      const latestDate = eventFound?.created_at || 0

      if (data.created_at > latestDate) {
        if (eventFound) {
          try {
            await Promise.all([
              events.delete(eventFound.id),
              ...eventFound.tags.map((tag) => tags.delete([eventFound.id, tag[0], tag[1]])),
            ])
          } catch (error) {
            console.error(error)
          }
        }
      } else {
        return false
      }
    }

    const isAddressable = isAddressableKind(data.kind)
    if (isAddressable) {
      const index = tags.index('kind_tag_value_created_at')
      const dTag = data.tags.find((x) => x[0] === 'd')
      if (dTag) {
        const tagFound = await index.get(
          IDBKeyRange.bound([data.kind, 'd', dTag[1], 0], [data.kind, 'd', dTag[1], Infinity]),
        )
        if (tagFound && tagFound.pubkey === data.pubkey) {
          const latestDate = tagFound?.created_at || 0
          if (data.created_at > latestDate) {
            const eventFound = await events.get(tagFound.eventId)
            if (eventFound) {
              try {
                await Promise.all([
                  events.delete(tagFound.eventId),
                  ...eventFound.tags.map((tag) => tags.delete([eventFound.id, tag[0], tag[1]])),
                ])
              } catch (error) {
                console.error(error)
              }
            }
          }
        }
      } else {
        return false
      }
    }

    await events.put(data)

    await Promise.all(
      data.tags
        .filter((tags) => tags.length > 1 && tags[0].length === 1)
        .map((tag, index) => {
          return tags.put({
            index,
            kind: data.kind,
            eventId: data.id,
            pubkey: data.pubkey,
            created_at: data.created_at,
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
