import { IDBStorage } from 'db/indexeddb/idb'
import { fakeNote } from 'utils/faker'
import { IDBEventQuery } from '../idb.events.query'

describe('Test event query', () => {
  test('assert query direction', async () => {
    const idb = new IDBStorage('test')
    const db = await idb.db

    const note1 = fakeNote({ id: '1', created_at: 1, kind: 1, pubkey: '1' })
    const note2 = fakeNote({ id: '2', created_at: 4, kind: 1, pubkey: '1' })
    const note3 = fakeNote({ id: '3', created_at: 5, kind: 1, pubkey: '1' })
    const note4 = fakeNote({ id: '4', created_at: 10, kind: 1, pubkey: '1' })
    const note5 = fakeNote({ id: '5', created_at: 11, kind: 1, pubkey: '1' })
    await idb.event.insert(note1)
    await idb.event.insert(note2)
    await idb.event.insert(note3)
    await idb.event.insert(note4)
    await idb.event.insert(note5)

    expect(await db.getAll('events')).toHaveLength(5)

    const query = new IDBEventQuery(db, { kinds: [1], authors: ['1'], since: 2, until: 10 })
    const res = query.start()

    expect((await res.next()).value).toStrictEqual(note4)
    expect((await res.next()).value).toStrictEqual(note3)
    expect((await res.next()).value).toStrictEqual(note2)
    expect((await res.next()).value).toStrictEqual(undefined)
  })

  test('assert #e tags', async () => {
    const idb = new IDBStorage('test')
    const db = await idb.db

    const note1 = fakeNote({ id: '1', created_at: 1, kind: 1, pubkey: '1' })
    const note2 = fakeNote({ id: '2', created_at: 2, kind: 1, pubkey: '1', tags: [['e', '1']] })
    const note3 = fakeNote({ id: '3', created_at: 3, kind: 1, pubkey: '1', tags: [['e', '1']] })
    const note4 = fakeNote({ id: '4', created_at: 4, kind: 1, pubkey: '1', tags: [['e', '2']] })
    await idb.event.insert(note1)
    await idb.event.insert(note2)
    await idb.event.insert(note3)
    await idb.event.insert(note4)

    const query = new IDBEventQuery(db, { kinds: [1], '#e': ['1'] })
    const res = query.start()
    expect((await res.next()).value).toStrictEqual(note3)
    expect((await res.next()).value).toStrictEqual(note2)
    expect((await res.next()).value).toStrictEqual(undefined)
  })

  test('assert #e sinces', async () => {
    const idb = new IDBStorage('test')
    const db = await idb.db
    const note1 = fakeNote({ id: '1', created_at: 1, kind: 1, pubkey: '1' })
    const note2 = fakeNote({ id: '2', created_at: 2, kind: 7, pubkey: '1', tags: [['e', '1']] })
    const note3 = fakeNote({ id: '3', created_at: 3, kind: 7, pubkey: '1', tags: [['e', '1']] })
    const note4 = fakeNote({ id: '4', created_at: 4, kind: 7, pubkey: '1', tags: [['e', '1']] })
    const note5 = fakeNote({ id: '5', created_at: 5, kind: 7, pubkey: '1', tags: [['e', '1']] })

    await idb.event.insert(note1)
    await idb.event.insert(note2)
    await idb.event.insert(note3)
    await idb.event.insert(note4)
    await idb.event.insert(note5)

    const query = new IDBEventQuery(db, { kinds: [7], '#e': ['1'], since: 4 })
    const res = query.start()
    expect((await res.next()).value).toStrictEqual(note5)
    expect((await res.next()).value).toStrictEqual(note4)
    expect((await res.next()).value).toStrictEqual(undefined)
  })

  test('assert #p tags', async () => {
    const idb = new IDBStorage('test')
    const db = await idb.db
    const note1 = fakeNote({ id: '1', created_at: 1, kind: 1, pubkey: '1' })
    const note2 = fakeNote({
      id: '2',
      created_at: 2,
      kind: 7,
      pubkey: '2',
      tags: [
        ['e', '1'],
        ['p', '1'],
      ],
    })
    const note3 = fakeNote({
      id: '3',
      created_at: 3,
      kind: 7,
      pubkey: '3',
      tags: [
        ['e', '2'],
        ['p', '4'],
      ],
    })

    await idb.event.insert(note1)
    await idb.event.insert(note2)
    await idb.event.insert(note3)

    const query = new IDBEventQuery(db, { kinds: [7], '#p': ['1'] })
    const res = query.start()
    expect((await res.next()).value).toStrictEqual(note2)
    expect((await res.next()).value).toStrictEqual(undefined)
  })

  test('assert #p tags with pagination', async () => {
    const idb = new IDBStorage('test')
    const db = await idb.db
    const note1 = fakeNote({ id: '1', created_at: 1, kind: 1, pubkey: '1' })
    const note2 = fakeNote({ id: '2', created_at: 2, kind: 7, pubkey: '2', tags: [['p', '1']] })
    const note3 = fakeNote({ id: '3', created_at: 3, kind: 7, pubkey: '3', tags: [['p', '1']] })
    const note4 = fakeNote({ id: '4', created_at: 4, kind: 7, pubkey: '4', tags: [['p', '1']] })
    const note5 = fakeNote({ id: '5', created_at: 5, kind: 7, pubkey: '5', tags: [['p', '1']] })
    const note6 = fakeNote({ id: '6', created_at: 6, kind: 7, pubkey: '6', tags: [['p', '1']] })

    await idb.event.insert(note1)
    await idb.event.insert(note2)
    await idb.event.insert(note3)
    await idb.event.insert(note4)
    await idb.event.insert(note5)
    await idb.event.insert(note6)

    const query = new IDBEventQuery(db, { kinds: [7], '#p': ['1'], since: 3, until: 5 })
    const res = query.start()
    expect((await res.next()).value).toStrictEqual(note5)
    expect((await res.next()).value).toStrictEqual(note4)
    expect((await res.next()).value).toStrictEqual(note3)
    expect((await res.next()).value).toStrictEqual(undefined) // note6 is out
  })

  test('assert query without authors', async () => {
    const idb = new IDBStorage('test')
    const db = await idb.db
    const note1 = fakeNote({ id: '1', created_at: 1, kind: 1, pubkey: '0123' })
    const note2 = fakeNote({ id: '2', created_at: 2, kind: 1, pubkey: '5123' })
    const note3 = fakeNote({ id: '3', created_at: 3, kind: 1, pubkey: '9123' })
    const note4 = fakeNote({ id: '4', created_at: 4, kind: 1, pubkey: 'a123' })
    const note5 = fakeNote({ id: '5', created_at: 5, kind: 1, pubkey: 'b123' })
    const note6 = fakeNote({ id: '6', created_at: 6, kind: 1, pubkey: 'd123' })
    const note7 = fakeNote({ id: '7', created_at: 7, kind: 1, pubkey: 'e123' })
    const note8 = fakeNote({ id: '8', created_at: 8, kind: 1, pubkey: 'f123' })

    await idb.event.insert(note1)
    await idb.event.insert(note2)
    await idb.event.insert(note3)
    await idb.event.insert(note4)
    await idb.event.insert(note5)
    await idb.event.insert(note6)
    await idb.event.insert(note7)
    await idb.event.insert(note8)

    const query = new IDBEventQuery(db, { kinds: [1] })
    const res = query.start()
    expect((await res.next()).value).toStrictEqual(note8)
    expect((await res.next()).value).toStrictEqual(note7)
    expect((await res.next()).value).toStrictEqual(note6)
    expect((await res.next()).value).toStrictEqual(note5)
    expect((await res.next()).value).toStrictEqual(note4)
    expect((await res.next()).value).toStrictEqual(note3)
    expect((await res.next()).value).toStrictEqual(note2)
    expect((await res.next()).value).toStrictEqual(note1)
    expect((await res.next()).value).toStrictEqual(undefined)
  })
})
