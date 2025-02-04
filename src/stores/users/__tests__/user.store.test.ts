import { parseUser } from '@/nostr/helpers/parseUser'
import { fakeEvent } from '@/utils/faker'
import { UserStore } from '../users.store'

test('assert userStore', () => {
  const store = new UserStore()
  const note1 = fakeEvent({ kind: 0, pubkey: '1', created_at: 1, content: '{"name": "A"}' })
  const note2 = fakeEvent({ kind: 0, pubkey: '1', created_at: 2, content: '{"name": "B"}' })
  store.add(note1, parseUser(note1))
  expect(store.get('1')!.event).toStrictEqual(note1)
  store.add(note2, parseUser(note2))
  expect(store.get('1')!.event).toStrictEqual(note2)
})
