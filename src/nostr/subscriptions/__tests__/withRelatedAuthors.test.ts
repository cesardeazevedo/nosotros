import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribe } from '../subscribe'
import { withRelatedAuthors } from '../withRelatedAuthor'

test('withRelatedAuthors', async ({ createMockRelay }) => {
  const relay1 = createMockRelay(RELAY_1, [fakeEvent({ id: '1', pubkey: 'p1' })])
  const relay2 = createMockRelay(RELAY_2, [])
  const relay3 = createMockRelay(RELAY_OUTBOX_1, [
    fakeEvent({ kind: Kind.RelayList, pubkey: 'p1', tags: [['r', RELAY_2, 'write']] }),
  ])

  const ctx = { relays: [RELAY_1] }
  const $ = subscribe({ kinds: [1], limit: 1 }, ctx).pipe(withRelatedAuthors(ctx))
  const spy = subscribeSpyTo($)

  await spy.onComplete()
  await relay1.close()
  await relay2.close()
  await relay3.close()

  // found p1 user on some random relay (RELAY_1)
  expect(relay1.received).toStrictEqual([
    ['REQ', '1', { kinds: [1], limit: 1 }],
    ['CLOSE', '1'],
    ['REQ', '2', { kinds: [0], authors: ['p1'] }],
    ['CLOSE', '2'],
  ])
  // Assert user metadata, as p2 writes on relay2
  expect(relay2.received).toStrictEqual([
    ['REQ', '1', { kinds: [0], authors: ['p1'] }],
    ['CLOSE', '1'],
  ])
  expect(relay3.received).toStrictEqual([
    ['REQ', '1', { kinds: [10002], authors: ['p1'] }],
    ['CLOSE', '1'],
  ])
})
