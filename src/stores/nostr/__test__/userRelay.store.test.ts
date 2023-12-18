import { fakeNote } from 'utils/faker'
import { RELAY_1, RELAY_2, test } from 'utils/fixtures'

describe('UserRelayStore', () => {
  test('Should expect relays based on read and write', async ({ root, createRelayList }) => {
    await createRelayList({ pubkey: '1', tags: [['r', 'wss://relay1.com']] })
    await createRelayList({ pubkey: '2', tags: [['r', 'wss://relay2.com', 'read']] })
    await createRelayList({ pubkey: '3', tags: [['r', 'wss://relay3.com', 'write']] })

    const store = root.userRelays
    expect(await store.fetchRelaysFromAuthor('1')).toStrictEqual(['wss://relay1.com'])
    expect(await store.fetchRelaysFromAuthor('2')).toStrictEqual(['wss://relay2.com'])
    expect(await store.fetchRelaysFromAuthor('2', true)).toStrictEqual([])
    expect(await store.fetchRelaysFromAuthor('2', false)).toStrictEqual(['wss://relay2.com'])
    expect(await store.fetchRelaysFromAuthor('3', true)).toStrictEqual(['wss://relay3.com'])
    expect(await store.fetchRelaysFromAuthor('3', false)).toStrictEqual([])
  })

  test('Should expect relays not blacklisted', async ({ root, createRelayList }) => {
    await createRelayList({
      pubkey: '1',
      tags: [
        ['r', 'wss://relay1.com'],
        ['r', 'wss://relay2.com'],
        ['r', 'wss://relay3.com'],
        ['r', 'wss://relay4.com'],
        ['r', 'wss://relay5.com'],
      ],
    })
    const store = root.userRelays
    expect(await store.fetchRelaysFromAuthor('1')).toStrictEqual([
      'wss://relay1.com',
      'wss://relay2.com',
      'wss://relay3.com',
      'wss://relay4.com',
      'wss://relay5.com',
    ])
    root.nostr.pool.blacklist.add('wss://relay1.com')
    root.nostr.pool.blacklist.add('wss://relay2.com')
    root.nostr.pool.blacklist.add('wss://relay3.com')
    expect(await store.fetchRelaysFromAuthor('1')).toStrictEqual(['wss://relay4.com', 'wss://relay5.com'])
  })

  test('Should expect relays list based on maxRelaysPerUser', async ({ root, createRelayList }) => {
    const store = root.userRelays
    root.settings.maxRelaysPerUser = 2
    await createRelayList({
      pubkey: '1',
      tags: [
        ['r', 'wss://relay1.com'],
        ['r', 'wss://relay2.com'],
        ['r', 'wss://relay3.com'],
        ['r', 'wss://relay4.com'],
        ['r', 'wss://relay5.com'],
      ],
    })
    expect(await store.fetchRelaysFromAuthor('1')).toStrictEqual(['wss://relay1.com', 'wss://relay2.com'])
  })

  test('Should add and new relaylist and not include old event', async ({ root }) => {
    const store = root.userRelays
    const event = fakeNote({
      kind: 10003,
      pubkey: '1',
      created_at: 1,
      tags: [['r', RELAY_1]],
    })
    await store.add(event)
    expect(store.relays.size).toStrictEqual(1)
    expect(store.relays.get('1')).toStrictEqual({
      pubkey: '1',
      relays: {
        [RELAY_1]: {
          read: true,
          write: true,
        },
      },
      timestamp: 1,
    })
    await store.add(
      fakeNote({
        kind: 10003,
        pubkey: '1',
        created_at: 2,
        tags: [
          ['r', RELAY_1],
          ['r', RELAY_2],
        ],
      }),
    )
    const expected = {
      pubkey: '1',
      relays: {
        [RELAY_1]: {
          read: true,
          write: true,
        },
        [RELAY_2]: {
          read: true,
          write: true,
        },
      },
      timestamp: 2,
    }
    expect(store.relays.size).toStrictEqual(1)
    expect(store.relays.get('1')).toStrictEqual(expected)
    await store.add(event)
    expect(store.relays.size).toStrictEqual(1)
    expect(store.relays.get('1')).toStrictEqual(expected)
  })
})
