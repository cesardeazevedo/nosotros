import { RELAY_1 } from '@/constants/testRelays'
import { db } from '@/nostr/db'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { take } from 'rxjs'
import { vi } from 'vitest'
import { relayStats, updateRelayStats$ } from '../queryRelayStats'

test('assert relayStats stream and refresh', async ({ insertRelayStats }) => {
  const queryAllSpy = vi.spyOn(db.relayStats, 'queryAll')
  const spy = subscribeSpyTo(relayStats.pipe(take(1)))
  const spy2 = subscribeSpyTo(relayStats.pipe(take(1)))
  await spy.onComplete()
  await spy2.onComplete()
  expect(queryAllSpy).toHaveBeenCalledTimes(1)
  expect(spy.getValues()).toStrictEqual([{}])
  await insertRelayStats(RELAY_1, { events: 1 })
  await updateRelayStats$()
  const spy3 = subscribeSpyTo(relayStats.pipe(take(1)))
  await spy3.onComplete()
  expect(queryAllSpy).toHaveBeenCalledTimes(2)
  expect(spy3.getValues()).toStrictEqual([
    {
      'wss://relay1.com': {
        connects: 0,
        closes: 0,
        events: 1,
        eoses: 0,
        notices: [],
        auths: 0,
        errors: 0,
        errorMessages: [],
        subscriptions: 0,
        publishes: 0,
        lastAuth: 0,
        lastConnected: 0,
        url: 'wss://relay1.com',
      },
    },
  ])
})
