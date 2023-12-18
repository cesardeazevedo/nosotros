import { autorun, toJS } from 'mobx'
import { test } from 'utils/fixtures'
import { delay } from 'utils/testHelpers'
import { vi } from 'vitest'
import { database } from '../database.store'
import { DBWriterBatcher } from '../db.batcher'
import { ObservableDB } from '../observabledb.store'

describe('ObservableDB', () => {
  test('Shold expect set(), get(), size(), has(), clear()', ({ observabledb }) => {
    observabledb.set('1', { value: 1 })
    expect(observabledb.get('1')).toStrictEqual({ value: 1 })
    expect(observabledb.size).toBe(1)
    expect(observabledb.has('1')).toBe(true)
    expect(observabledb.cachedKeys.has('1')).toBe(true)
    observabledb.clear()
    expect(observabledb.has('1')).toBe(false)
    expect(observabledb.size).toBe(0)
  })

  test('Should expect fetch() before and after set()', async ({ observabledb }) => {
    expect(await observabledb.fetch('1')).toBeUndefined()
    observabledb.set('1', { value: 1 })
    expect(await observabledb.fetch('1')).toStrictEqual({ value: 1 })
  })

  test('Should expect multiple fetch calls and not overwrite the original data', async ({ observabledb }) => {
    const db = await database.getDB
    await db.put(observabledb.name, { id: '1', value: '1' })
    const promise = observabledb.fetch('1')
    observabledb.set('1', { id: '1', value: '2' })
    await promise
    expect(observabledb.get('1')).toStrictEqual({ id: '1', value: '2' })
  })

  test('Should expect fetch() match the data that was manually put on indexedb directly', async ({ observabledb }) => {
    const db = await database.getDB
    await db.put('test', { id: '1' })
    // Nothing on local cache
    expect(observabledb.size).toStrictEqual(0)
    expect(observabledb.has('1')).toStrictEqual(false)
    // Found on indexeddb, then set on local cache
    expect(await observabledb.fetch('1')).toStrictEqual({ id: '1' })
    expect(observabledb.size).toStrictEqual(1)
    expect(observabledb.has('1')).toStrictEqual(true)
  })

  test('Should expect observable stub being called only twice after get/set unrelated key', async () => {
    const db = new ObservableDB<{ value: number }>('test', { cacheTime: 0, cachePruneInterval: 400 })
    const stub = vi.fn()
    const dispose = autorun(() => {
      stub(toJS(db.get('1')))
    })
    expect(db.get('1')).toBeUndefined()
    expect(db._data.size).toBe(0)
    expect(db.set('1', { value: 1 })).toStrictEqual({ value: 1 })
    expect(db._data.size).toBe(1)

    // Get and Set unrelated key
    expect(db.get('2')).toBeUndefined()
    expect(db.set('2', { value: 2 })).toStrictEqual({ value: 2 })
    db._data.delete('2')

    // Make get('1') unobserved
    dispose()
    await delay()
    expect(db._data.size).toBe(0)
    expect(db.get('1')).toBeUndefined()
    db.clear()

    expect(stub).toHaveBeenNthCalledWith(1, undefined)
    expect(stub).toHaveBeenNthCalledWith(2, { value: 1 })
  })

  test('Should expect the batcher write only the latest values', async () => {
    const batcher = new DBWriterBatcher(100)
    const store = new ObservableDB('test', { batcher })
    store.set('1', { id: '1', value: 1 })
    store.set('1', { id: '1', value: 11 })
    store.set('2', { id: '2', value: 2 })
    store.set('2', { id: '2', value: 22 })
    store.set('3', { id: '3', value: 3 })
    store.set('3', { id: '3', value: 33 })
    store.set('4', { id: '4', value: 4 })
    store.set('4', { id: '4', value: 44 })
    // wait for batcher to write
    await delay()
    expect(store.get('1')).toStrictEqual({ id: '1', value: 11 })
    expect(store.get('2')).toStrictEqual({ id: '2', value: 22 })
    expect(store.get('3')).toStrictEqual({ id: '3', value: 33 })
    expect(store.get('4')).toStrictEqual({ id: '4', value: 44 })
    store.clear()
  })

  test('Should expect cachedKeys being loaded', async () => {
    database.schemas.set('test', { keyPath: 'id', indexes: [] })
    await database.initialize()
    await database.clear()
    const db = await database.getDB
    await db.put('test', { id: '1' })
    const store = new ObservableDB('test')
    await delay()
    expect(store.cachedKeys.size).toBe(1)
  })

  test('Should assert serialization and deserialization', async () => {
    class ClassData {
      id: number
      name: string

      constructor(id: number, name: string) {
        this.id = id
        this.name = name
      }

      static deserialize() {}

      serialize() {}
    }

    type StoreData = { id: number; name: string }

    const store = new ObservableDB<StoreData, ClassData>('test', {
      serialize: (x) => ({ id: x.id, name: x.name }),
      deserialize: (data: StoreData) => {
        return new ClassData(data.id, data.name)
      },
    })
    const instance = new ClassData(1, 'user1')
    expect(store.set('1', instance)).toStrictEqual({ id: 1, name: 'user1' })
    const found = await store.fetch('1')
    expect(found?.id).toStrictEqual(1)
    expect(found?.name).toStrictEqual('user1')
  })
})
