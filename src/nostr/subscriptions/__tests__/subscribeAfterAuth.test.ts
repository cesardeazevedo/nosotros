import { RELAY_1 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribe } from '../subscribe'

test('assert subscribeAfterAuth on eose', async ({ createMockRelay }) => {
  const relay = createMockRelay(RELAY_1, [])
  const sub = subscribe({ ids: ['1'] }, { relays: [RELAY_1] })
  const spy = subscribeSpyTo(sub)
  await spy.onComplete()
  await relay.close()
  expect(spy.getValues()).toStrictEqual([])
})
