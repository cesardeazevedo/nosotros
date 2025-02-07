import { RELAY_1 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeUser } from '../subscribeUser'

test('assert subscriptionUser', async ({ createMockRelay, createClient }) => {
  const event1 = fakeEvent({ kind: 0, id: '1', content: '{}', pubkey: '1', created_at: 1 })
  const event2 = fakeEvent({ kind: 10002, id: '1', content: '{}', pubkey: '1', created_at: 1 })
  const relay = createMockRelay(RELAY_1, [event1, event2])

  const client = createClient({ relays: [RELAY_1], settings: { outbox: false } })
  const $ = subscribeUser('1', client)
  const spy = subscribeSpyTo($)
  await spy.onComplete()
  await relay.close()

  expect(relay.received).toStrictEqual([
    ['REQ', '1', { kinds: [0, 10002], authors: ['1'] }],
    ['CLOSE', '1'],
  ])
  expect(relay.sent).toStrictEqual([
    ['EVENT', '1', event1],
    ['EVENT', '1', event2],
  ])
})
