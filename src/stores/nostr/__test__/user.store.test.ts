import { fakeUserData } from 'utils/faker'
import { test } from 'utils/fixtures'
import { delay } from 'utils/testHelpers'

describe('UserStore', () => {
  test('add()', async ({ root }) => {
    const user = fakeUserData({ id: 'npub1' })
    const store = root.users
    store.add({
      id: 'npub1',
      kind: 0,
      content: JSON.stringify(user),
      created_at: Date.now(),
      pubkey: 'npub1',
      sig: '',
      tags: [],
    })
    await delay()
    expect(store.users._data.size).toBe(1)
    expect(await store.users.fetch('npub1')).toEqual(user)
  })
})
