import type { NostrFilter } from 'core/types'
import type { IDBPDatabase, IDBPIndex, IDBPObjectStore, IDBPTransaction } from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'

type Transaction = IDBPTransaction<IndexedDBSchema, ('events' | 'tags')[]>

type Stores = ['events', 'tags']
type EventStore = IDBPObjectStore<IndexedDBSchema, Stores, 'events'>
type EventIndexes = IDBPIndex<IndexedDBSchema, Stores, 'events'>

type TagStore = IDBPObjectStore<IndexedDBSchema, Stores, 'tags'>
type TagIndexes = IDBPIndex<IndexedDBSchema, Stores, 'tags'>

export class IDBEventQuery {
  private transaction: Transaction
  private events: EventStore
  private tags: TagStore

  constructor(
    private db: IDBPDatabase<IndexedDBSchema>,
    private filter: NostrFilter,
  ) {
    this.transaction = this.db.transaction(['events', 'tags'], 'readonly')
    this.events = this.transaction.objectStore('events')
    this.tags = this.transaction.objectStore('tags')
  }

  async *start() {
    if (this.filter.authors) {
      for (const kind of this.filter.kinds || []) {
        const index = this.events.index('kind_pubkey_created_at')
        for (const author of this.filter.authors) {
          const range = IDBKeyRange.bound(
            [kind, author, this.filter.since || 0],
            [kind, author, this.filter.until || Infinity],
          )
          yield* this.iterate(index, range)
        }
      }
    } else if (this.filter.ids) {
      for (const value of this.filter.ids) {
        yield* this.getByKey(this.events, value)
      }
    } else {
      let hasTags = false
      for (const [key, values = []] of Object.entries(this.filter)) {
        if (key[0] === '#') {
          hasTags = true
          const tag = key.slice(1)
          const index = this.tags.index('kind_tag_value_created_at')
          for (const kind of this.filter.kinds || []) {
            for (const value of values as string[]) {
              const range = IDBKeyRange.bound(
                [kind, tag, value, this.filter.since || 0],
                [kind, tag, value, this.filter.until || Infinity],
              )
              yield* this.iterateTags(index, range)
            }
          }
        }
      }
      if (!hasTags && this.filter.kinds) {
        for (const kind of this.filter.kinds || []) {
          const index = this.events.index('kind_pubkey_created_at')
          const range = IDBKeyRange.bound(
            [kind, '0', this.filter.since || 0],
            [kind, 'g', this.filter.until || Infinity],
          )
          yield* this.iterate(index, range)
        }
      }
    }
  }

  private async *getByKey(store: EventStore, key: string) {
    const value = await store.get(key)
    if (value) {
      yield value
    }
  }

  private async *iterate(index: EventIndexes, range: IDBKeyRange) {
    for await (const cursor of index.iterate(range, 'prev')) {
      if (cursor.value) {
        yield cursor.value
      }
    }
  }

  private async *iterateTags(index: TagIndexes, range: IDBKeyRange) {
    for await (const cursor of index.iterate(range, 'prev')) {
      yield* this.getByKey(this.events, cursor.value.eventId)
    }
  }
}
