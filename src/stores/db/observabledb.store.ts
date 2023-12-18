import { DateTime } from 'luxon'
import { makeAutoObservable, observable } from 'mobx'
import { database } from './database.store'
import { DBAtom } from './db.atom'
import { DBWriterBatcher } from './db.batcher'

type CacheOptions<S, T> = {
  keyPath: string
  indexes: (keyof T)[]
  cacheTime: number
  cachePruneInterval: number
  expireTime: number
  expirePruneInterval: number
  batcher: DBWriterBatcher
  serialize: (value: S) => T
  deserialize: (value: T) => S
}

export const dbBatcher = new DBWriterBatcher()

const defaultOptions = {
  keyPath: 'id',
  indexes: [],
  /**
   * In memory cacheTime in miliseconds (default: 1 hour)
   */
  cacheTime: 3600000,
  cachePruneInterval: 60000,
  /**
   * Expire time in miliseconds (default: 1 hour)
   */
  expireTime: 3600000,
  expirePruneInterval: 60000,
  batcher: dbBatcher,
}

export class ObservableDB<T extends Record<string, unknown>, S = T> {
  name: string
  options: CacheOptions<S, T>

  cachedKeys = new Set<string>()
  _data = observable.map<string, DBAtom<S>>({})

  constructor(key: string, options: Partial<CacheOptions<S, T>> = defaultOptions) {
    makeAutoObservable(this, {
      name: false,
      options: false,
    })

    this.name = key
    this.options = Object.assign({}, defaultOptions, options) as CacheOptions<S, T>

    database.schemas.set(key, {
      indexes: (options.indexes ?? []) as string[],
      keyPath: options.keyPath ?? defaultOptions.keyPath,
    })

    this.pruneExpiredKeys()
    setInterval(() => this.pruneUnobservedKeys(), this.options.cachePruneInterval)
    setInterval(() => this.pruneExpiredKeys(), this.options.expirePruneInterval)

    this.keys().then((keys) => {
      this.cachedKeys = keys as Set<string>
    })
  }

  private _serialize(data: S) {
    return this.options.serialize?.(data) || data
  }

  private _deserialize(data: T) {
    return (data && Object.keys(data).length > 0 ? this.options.deserialize?.(data) || data : data) as S
  }

  /**
   * Get data from cache and automatically attach a listener to remove it when it's no longer observed
   */
  private _get(key: string) {
    return this._data.get(key)?.data
  }

  private _set(key: string, value: S) {
    this.cachedKeys.add(key)
    this._data.set(key, new DBAtom(value))
  }

  private pruneUnobservedKeys() {
    for (const [key, atom] of this._data) {
      if (!atom.isBeingObserved && Date.now() - atom.lastTimeUnobserved > this.options.cacheTime) {
        this._data.delete(key)
      }
    }
  }

  private async pruneExpiredKeys() {
    try {
      const db = await database.getDB
      const tx = db.transaction(this.name, 'readwrite')
      const store = tx.objectStore(this.name)
      const index = store.index('inserted_at')
      const since = DateTime.now().minus({ milliseconds: this.options.expireTime }).toMillis()
      const range = IDBKeyRange.upperBound(since, true)

      for await (const cursor of index.iterate(range)) {
        cursor.delete()
      }
      await tx.done
    } catch (error) {
      console.warn(error)
    }
  }

  async fetch(key: string): Promise<S | undefined> {
    const current = this._get(key)
    if (current) {
      return current
    }
    const db = await database.getDB
    const value = await db.get(this.name, key)
    const { inserted_at, ...rest } = value || {}
    const data = this._deserialize(rest)
    if (value && !this.has(key)) {
      this._set(key, data)
      return data
    }
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

  get(key: string | undefined) {
    if (key) {
      const result = this._get(key)
      if (result) {
        return result
      }
      this.fetch(key)
    }
  }

  async getByIndex(key: string, indexName: string) {
    const db = await database.getDB
    const tx = db.transaction(this.name, 'readonly')
    const store = tx.objectStore(this.name)
    const index = store.index(indexName)

    return await index.get(key)
  }

  set(key: string, value: S): T {
    const data = this._serialize(value)
    this._set(key, value)
    this.options.batcher.write(this.name, data)
    return data
  }
}
