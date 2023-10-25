import { fakeNote } from 'utils/faker'
import { test } from 'utils/fixtures'

describe('ContactStore', () => {
  test('add()', async ({ root }) => {
    const store = root.contacts
    const data1 = fakeNote({
      pubkey: '1',
      created_at: 1,
      tags: [
        ['p', '1'],
        ['p', '2'],
        ['p', '3'],
      ],
    })
    await store.add(data1)
    expect(await store.contacts.size).toBe(1)
    expect(await store.fetchByAuthor('1')).toStrictEqual({
      id: '1',
      timestamp: 1,
      tags: data1.tags,
    })
    const data2 = fakeNote({
      pubkey: '1',
      created_at: 2,
      tags: [
        ['p', '4'],
        ['p', '5'],
        ['p', '6'],
      ],
    })
    await store.add(data2)
    expect(await store.contacts.size).toBe(1)
    expect(await store.fetchByAuthor('1')).toStrictEqual({
      id: '1',
      timestamp: 2,
      tags: data2.tags,
    })
    // Old created_at, should be ignored
    const data3 = fakeNote({
      pubkey: '1',
      created_at: 1,
      tags: [
        ['p', '7'],
        ['p', '8'],
        ['p', '9'],
      ],
    })
    await store.add(data3)
    expect(await store.contacts.size).toBe(1)
    expect(await store.fetchByAuthor('1')).toStrictEqual({
      id: '1',
      timestamp: 2,
      tags: data2.tags,
    })
  })

  test('getByAuthor()', async ({ root }) => {
    const store = root.contacts
    const data = fakeNote({
      pubkey: '1',
      created_at: 1,
      tags: [
        ['p', '1'],
        ['p', '2'],
        ['p', '3'],
      ],
    })
    await store.add(data)
    expect(await store.contacts.size).toBe(1)
    expect(await store.fetchByAuthor('1')).toStrictEqual({ id: '1', timestamp: 1, tags: data.tags })
    expect(await store.fetchByAuthor('2')).toStrictEqual({ timestamp: 0, tags: [] })
  })
})
