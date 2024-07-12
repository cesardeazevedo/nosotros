import type { NostrFilter } from 'core/types'
import type { IDBPDatabase, IDBPIndex, IDBPObjectStore, IDBPTransaction } from 'idb'
import type { IndexedDBSchema } from '../idb.schemas'

type Transaction = IDBPTransaction<IndexedDBSchema, ('events' | 'tags')[]>

type Stores = ['events', 'tags']
type EventStore = IDBPObjectStore<IndexedDBSchema, Stores, 'events'>
type EventIndexes = IDBPIndex<IndexedDBSchema, Stores, 'events'>

type TagStore = IDBPObjectStore<IndexedDBSchema, Stores, 'tags'>
type TagIndexes = IDBPIndex<IndexedDBSchema, Stores, 'tags'>

class IDBEventQuery {
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

  *start() {
    if (this.filter.since && this.filter.until && this.filter.authors) {
      const index = this.events.index('kind_pubkey_created_at')
      for (const kind of this.filter.kinds || [0]) {
        for (const author of this.filter.authors) {
          const range = IDBKeyRange.bound([kind, author, this.filter.since], [kind, author, this.filter.until])
          yield this.iterate(index, range)
        }
      }
    } else if (this.filter.authors) {
      for (const kind of this.filter.kinds || []) {
        const index = this.events.index('kind_pubkey')
        for (const author of this.filter.authors) {
          const range = IDBKeyRange.only([kind, author])
          yield this.iterate(index, range)
        }
      }
    } else if (this.filter.ids) {
      for (const value of this.filter.ids) {
        yield this.getByKey(this.events, value)
      }
    } else if (this.filter['#e'] || this.filter['#p']) {
      const tag = this.filter['#e'] ? 'e' : 'p'
      const index = this.tags.index('kind_tag_value')
      for (const kind of this.filter.kinds || []) {
        for (const value of this.filter[('#' + tag) as `#${string}`] || []) {
          const range = IDBKeyRange.only([kind, tag, value])
          yield this.iterateTags(index, range)
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
    for await (const cursor of index.iterate(range)) {
      if (cursor.value) {
        yield cursor.value
      }
    }
  }

  private async *iterateTags(index: TagIndexes, range: IDBKeyRange) {
    for await (const cursor of index.iterate(range)) {
      yield* this.getByKey(this.events, cursor.value.eventId)
    }
  }
}

export default IDBEventQuery
