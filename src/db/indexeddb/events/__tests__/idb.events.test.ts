import { IDBStorage } from 'db/indexeddb/idb'
import type { IDBPDatabase } from 'idb'
import { fakeNote } from 'utils/faker'
import { test } from 'utils/fixtures'
import type { IndexedDBSchema } from '../../idb.schemas'
import { RELAY_1 } from '@/constants/testRelays'

async function getAndAssertEvent(db: IDBPDatabase<IndexedDBSchema>, id: string) {
  expect((await db.get('events', id))?.id).toStrictEqual(id)
}

describe('Test storage', () => {
  test('assert insert replaceable events', async () => {
    const idb = new IDBStorage('test')
    const db = await idb.db

    const event = fakeNote({
      id: '1',
      kind: 3,
      pubkey: 'pubkey1',
      created_at: 1,
      tags: [['p', '1']],
    })

    await idb.event.insert(event)
    await getAndAssertEvent(db, event.id)

    // Insert a newer event
    const event2 = fakeNote({
      id: '2',
      kind: 3,
      pubkey: 'pubkey1',
      created_at: 2,
      tags: [
        ['p', '1'],
        ['p', '2'],
      ],
    })

    await idb.event.insert(event2)
    await getAndAssertEvent(db, event2.id)

    // Insert an older event
    const event3 = fakeNote({
      id: '3',
      kind: 3,
      pubkey: 'pubkey1',
      created_at: 1, // older
      tags: [
        ['p', '1'],
        ['p', '2'],
        ['p', '3'],
      ],
    })

    const res = await idb.event.insert(event3)
    expect(res).toBe(false)

    expect(await db.getAll('events')).toHaveLength(1)
    expect(await db.get('events', event3.id)).toBeUndefined()

    const event4 = fakeNote({
      id: '4',
      kind: 3,
      pubkey: 'pubkey1',
      created_at: 4,
      tags: [
        ['p', '1'],
        ['p', '2'],
        ['p', '3'],
        ['p', '4'],
      ],
    })

    await idb.event.insert(event4)
    await getAndAssertEvent(db, event4.id)
    expect(await db.getAll('events')).toHaveLength(1)
    expect(await db.getAll('tags')).toHaveLength(4)
  })

  test('assert queryByPubkey', async () => {
    const idb = new IDBStorage('test')
    const event1 = fakeNote({
      id: '1',
      kind: 10002,
      pubkey: '1',
      created_at: 1,
      tags: [['r', RELAY_1]],
    })
    const event2 = fakeNote({
      id: '2',
      kind: 10002,
      pubkey: '1',
      created_at: 3,
      tags: [['r', RELAY_1]],
    })
    const event3 = fakeNote({
      id: '3',
      kind: 10002,
      pubkey: '1',
      created_at: 2,
      tags: [['r', RELAY_1]],
    })
    await idb.event.insert(event1)
    expect(await idb.event.queryByPubkey(10002, '1')).toStrictEqual(event1)
    await idb.event.insert(event2)
    expect(await idb.event.queryByPubkey(10002, '1')).toStrictEqual(event2)
    await idb.event.insert(event3)
    expect(await idb.event.queryByPubkey(10002, '1')).toStrictEqual(event2)
  })
})
