import { test } from 'utils/fixtures'

describe('UserRelayStore', () => {
  test('Test getRelayFromUsers()', async ({ root, createRelayList }) => {
    await createRelayList({ pubkey: '1', tags: [['r', 'wss://relay1.com']] })
    await createRelayList({ pubkey: '2', tags: [['r', 'wss://relay2.com', 'read']] })
    await createRelayList({ pubkey: '3', tags: [['r', 'wss://relay3.com', 'write']] })

    const store = root.userRelays
    expect(await store.getRelaysFromAuthor('1')).toStrictEqual(['wss://relay1.com'])
    expect(await store.getRelaysFromAuthor('2')).toStrictEqual(['wss://relay2.com'])
    expect(await store.getRelaysFromAuthor('2', true)).toStrictEqual([])
    expect(await store.getRelaysFromAuthor('2', false)).toStrictEqual(['wss://relay2.com'])
    expect(await store.getRelaysFromAuthor('3', true)).toStrictEqual(['wss://relay3.com'])
    expect(await store.getRelaysFromAuthor('3', false)).toStrictEqual([])
  })
})
