import { RELAY_1, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeUser } from '../subscribeUser'

test('assert subscriptionUser', async ({ createMockRelay }) => {
  const event1 = fakeEvent({ kind: 0, id: '1', content: '{}', pubkey: '1', created_at: 1 })
  const relay = createMockRelay(RELAY_1, [event1])
  const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [])

  const $ = subscribeUser('1', { relays: [RELAY_1] })
  const spy = subscribeSpyTo($)
  await spy.onComplete()
  await relay.close()
  await relayOutbox.close()

  expect(relay.received).toStrictEqual([
    ['REQ', '1', { kinds: [0], authors: ['1'] }],
    ['CLOSE', '1'],
  ])
  expect(relay.sent).toStrictEqual([['EVENT', '1', event1]])
})
