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
      contacts: {
        '1': true,
        '2': true,
        '3': true,
      },
    })
    await store.add(
      fakeNote({
        pubkey: '1',
        created_at: 2,
        tags: [
          ['p', '4'],
          ['p', '5'],
          ['p', '6'],
        ],
      }),
    )
    expect(await store.contacts.size).toBe(1)
    expect(await store.fetchByAuthor('1')).toStrictEqual({
      id: '1',
      timestamp: 2,
      contacts: {
        '4': true,
        '5': true,
        '6': true,
      },
    })
    // Old created_at, should be ignored
    await store.add(
      fakeNote({
        pubkey: '1',
        created_at: 1,
        tags: [
          ['p', '7'],
          ['p', '8'],
          ['p', '9'],
        ],
      }),
    )
    expect(await store.contacts.size).toBe(1)
    expect(await store.fetchByAuthor('1')).toStrictEqual({
      id: '1',
      timestamp: 2,
      contacts: {
        '4': true,
        '5': true,
        '6': true,
      },
    })
  })

  test('Should assert isFollowing', async ({ root }) => {
    root.auth.pubkey = '1'
    const store = root.contacts
    await store.add(
      fakeNote({
        pubkey: '1',
        created_at: 1,
        tags: [['p', '2']],
      }),
    )
    expect(store.isFollowing('2')).toBe(true)
    expect(store.isFollowing('3')).toBe(false)
  })
})
