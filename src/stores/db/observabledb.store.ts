import { IDBPDatabase } from 'idb'
import { DateTime } from 'luxon'
import { comparer, makeAutoObservable, observable, runInAction } from 'mobx'
import { database } from './database.store'
import { DBAtom } from './db.atom'
import { DBWriterBatcher } from './db.batcher'

type CacheOptions<T> = {
  keyPath: string
  indexes: (keyof T)[]
  /**
   * In memory cacheTime in miliseconds (default: 3600000 = 1 * 60 * 60 * 1000 = 1 hour)
   */
  cacheTime: number
  cachePruneInterval: number
  /**
   * Expire time in miliseconds (default: 3600000 = 1 * 60 * 60 * 1000 = 1 hour)
   */
  expireTime: number
  expirePruneInterval: number
  batcher: DBWriterBatcher
}

const defaultOptions: CacheOptions<unknown> = {
  keyPath: 'id',
  indexes: [],
  cacheTime: 60000,
  cachePruneInterval: 62000,
  expireTime: 3600000,
  expirePruneInterval: 60000,
  batcher: new DBWriterBatcher(),
}

export class ObservableDB<T extends Record<string, unknown>> {
  name: string
  cacheTime: number
  expireTime: number

  _data = observable.map<string, DBAtom<T>>({})
  _dbPromise: Promise<IDBPDatabase>
  _batcher: DBWriterBatcher

  private static _db: Promise<IDBPDatabase>
  private static _schemas = new Map<string, string[]>()

  constructor(key: string, options: Partial<CacheOptions<T>> = defaultOptions) {
    makeAutoObservable(this, {
      name: false,
    })

    this.name = key
    this.cacheTime = options.cacheTime ?? defaultOptions.cacheTime
    this.expireTime = options.expireTime ?? defaultOptions.expireTime
    this._batcher = options.batcher ?? defaultOptions.batcher
    this._dbPromise = ObservableDB._db

    // database.schemas.set(key, indexes as string[])
    database.schemas.set(key, {
      indexes: (options.indexes ?? []) as string[],
      keyPath: options.keyPath ?? defaultOptions.keyPath,
    })

    this.pruneExpiredKeys()
    setInterval(this.pruneUnobservedKeys.bind(this), options.cachePruneInterval ?? defaultOptions.cachePruneInterval)
    setInterval(this.pruneExpiredKeys.bind(this), options.expirePruneInterval ?? defaultOptions.expirePruneInterval)
  }

  /**
   * Get data from cache and automatically attach a listener to remove it when it's no longer observed
   */
  private _get(key: string) {
    return this._data.get(key)?.data
  }

  private _set(key: string, value: T) {
    this._data.set(key, new DBAtom(value))
  }

  private pruneUnobservedKeys() {
    for (const [key, atom] of this._data) {
      if (!atom.isBeingObserved && Date.now() - atom.lastTimeUnobserved > this.cacheTime) {
        this._data.delete(key)
      }
    }
  }

  private async pruneExpiredKeys() {
    const db = await database.getDB
    const tx = db.transaction(this.name, 'readwrite')
    const store = tx.objectStore(this.name)
    const index = store.index('inserted_at')
    const since = DateTime.now().minus({ milliseconds: this.expireTime }).toMillis()
    const range = IDBKeyRange.upperBound(since, true)

    for await (const cursor of index.iterate(range)) {
      cursor.delete()
    }
    await tx.done
  }

  async fetch(key: string): Promise<T | null | undefined> {
    const current = this._get(key)
    if (current) {
      return current
    }
    const db = await database.getDB
    const value = await db.get(this.name, key)
    const { inserted_at, ...rest } = value || {}
    if (value) {
      this.set(key, rest)
    }
    return value
  }

  clear() {
    this._data.clear()
  }

  get size() {
    return this._data.size
  }

  async keys() {
    const db = await database.getDB
    const keys = await db.getAllKeys(this.name)
    return new Set(keys)
  }

  has(key: string) {
    return this._data.has(key)
  }

  get(key: string) {
    const result = this._get(key)

    if (!result) {
      this.fetch(key)
    } else {
      return result
    }
  }

  async getByIndex(key: string, indexName: string) {
    const db = await database.getDB
    const tx = db.transaction(this.name, 'readonly')
    const store = tx.objectStore(this.name)
    const index = store.index(indexName)

    return await index.get(key)
  }

  async getItems(keys: string[]): Promise<T[]> {
    const db = await database.getDB
    const tx = db.transaction(this.name)
    const store = tx.objectStore(this.name)
    const values: T[] = []
    for (const key of keys) {
      const { inserted_at, ...rest } = (await store.get(key)) || {}
      values.push(rest)
    }
    runInAction(() => {
      for (let i = 0; i < keys.length; i++) {
        this._data.set(keys[i], new DBAtom(values[i]))
      }
    })
    await tx.done
    return values
  }

  async set(key: string, value: T): Promise<T> {
    const cached = this._data.get(key)
    if (!comparer.structural(cached?.data, value)) {
      this._set(key, value)
      this._batcher.write(this.name, value)
    }
    return value
  }
}
