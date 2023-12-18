import { fakeUserData } from 'utils/faker'
import { test } from 'utils/fixtures'

describe('UserStore', () => {
  test('add()', async ({ root }) => {
    const id = 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e'
    const aboutParsed = [{ content: ['user description'], kind: 'text' }]
    const user = fakeUserData({ name: 'name1' })
    const store = root.users
    const event1 = {
      id: '1',
      kind: 0,
      content: JSON.stringify(user),
      created_at: 10,
      pubkey: id,
      sig: '',
      tags: [],
    }
    await store.add(event1)
    expect(store.users._data.size).toBe(1)
    expect((await store.users.fetch(id))?.metadata).toEqual({
      ...user,
      id,
      aboutParsed,
      npub: 'npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c',
      createdAt: 10,
    })

    const user2 = fakeUserData({ name: 'name2' })
    const event2 = {
      id: '2',
      kind: 0,
      content: JSON.stringify(user2),
      created_at: 20,
      pubkey: id,
      sig: '',
      tags: [],
    }
    await store.add(event2)
    expect((await store.users.fetch(id))?.metadata).toEqual({
      ...user2,
      id,
      aboutParsed,
      npub: 'npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c',
      createdAt: 20,
    })

    // Adding a user with a lower timestamp should not update the user
    await store.add(event1)
    expect((await store.users.fetch(id))?.metadata).toEqual({
      ...user2,
      id,
      aboutParsed,
      npub: 'npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c',
      createdAt: 20,
    })
  })
})
