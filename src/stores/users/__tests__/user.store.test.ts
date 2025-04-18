import { parseUser } from '@/nostr/helpers/parseUser'
import { fakeEventMeta } from '@/utils/faker'
import { UserStore } from '../users.store'

test('assert userStore', () => {
  const store = new UserStore()
  const note1 = fakeEventMeta({ kind: 0, pubkey: '1', created_at: 1, content: '{"name": "A"}' }, parseUser)
  const note2 = fakeEventMeta({ kind: 0, pubkey: '1', created_at: 2, content: '{"name": "B"}' }, parseUser)
  store.add(note1)
  expect(store.get('1')!.event).toStrictEqual(note1)
  store.add(note2)
  expect(store.get('1')!.event).toStrictEqual(note2)
})
