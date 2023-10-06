import { autorun, toJS } from 'mobx'
import { test } from 'utils/fixtures'
import { delay } from 'utils/testHelpers'
import { vi } from 'vitest'
import { database } from '../database.store'
import { DBWriterBatcher } from '../db.batcher'
import { ObservableDB } from '../observabledb.store'

describe('ObservableDB', () => {
  test('set(), get(), size(), has(), clear()', ({ observabledb }) => {
    observabledb.set('1', { value: 1 })
    expect(observabledb.get('1')).toStrictEqual({ value: 1 })
    expect(observabledb.size).toBe(1)
    expect(observabledb.has('1')).toBe(true)
    observabledb.clear()
    expect(observabledb.has('1')).toBe(false)
    expect(observabledb.size).toBe(0)
  })

  test('set() and fetch()', async ({ observabledb }) => {
    expect(await observabledb.fetch('1')).toBeUndefined()
    observabledb.set('1', { value: 1 })
    expect(await observabledb.fetch('1')).toStrictEqual({ value: 1 })
  })

  test('manually set and fetch()', async ({ observabledb }) => {
    const db = await database.getDB
    await db.put(observabledb.name, { id: 1 })
    const stub = vi.fn().mockResolvedValue({ id: 'mocked' })
    db.get = stub
    expect(await observabledb.fetch('1')).toStrictEqual({ id: 'mocked' })
    expect(stub).toBeCalledTimes(1)
  })

  test('unobserved', async () => {
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

  test('duplicated set', async ({ observabledb }) => {
    const stub = vi.fn()
    autorun(() => {
      stub(toJS(observabledb.get('1')))
    })
    await observabledb.set('1', { value: 2 })
    await observabledb.set('1', { value: 2 }) // duplicate
    await observabledb.set('1', { value: 3 })
    await observabledb.set('1', { value: 4 })
    expect(stub).toHaveBeenNthCalledWith(1, undefined)
    expect(stub).toHaveBeenNthCalledWith(2, { value: 2 })
    expect(stub).toHaveBeenNthCalledWith(3, { value: 3 })
    expect(stub).toHaveBeenNthCalledWith(4, { value: 4 })
  })

  test('batcher', async () => {
    const batcher = new DBWriterBatcher(100)
    const store = new ObservableDB('test1', { batcher })
    await store.set('1', { id: '1', value: 1 })
    await store.set('1', { id: '1', value: 11 })
    await store.set('2', { id: '2', value: 2 })
    await store.set('2', { id: '2', value: 22 })
    await store.set('3', { id: '3', value: 3 })
    await store.set('3', { id: '3', value: 33 })
    await store.set('4', { id: '4', value: 4 })
    await store.set('4', { id: '4', value: 44 })
    const store2 = new ObservableDB('test2')
    store2._batcher = batcher
    await store2.set('1', { id: '1', value: 1 })
    await store2.set('1', { id: '1', value: 111 })
    await store2.set('2', { id: '2', value: 2 })
    await store2.set('2', { id: '2', value: 222 })
    // Create the database
    await database.initialize()
    // wait for batcher to write
    await delay()
    expect(await store.getItems(['1', '2', '3', '4'])).toStrictEqual([
      { id: '1', value: 11 },
      { id: '2', value: 22 },
      { id: '3', value: 33 },
      { id: '4', value: 44 },
    ])
    expect(await store2.getItems(['1', '2'])).toStrictEqual([
      { id: '1', value: 111 },
      { id: '2', value: 222 },
    ])
    store.clear()
    store2.clear()
  })
})
