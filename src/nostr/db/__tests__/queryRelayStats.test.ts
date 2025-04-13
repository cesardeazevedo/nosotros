import { db } from '@/nostr/db'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { vi } from 'vitest'
import { relayStats } from '../queryRelayStats'

test('assert relayStats stream', async () => {
  const queryAllSpy = vi.spyOn(db.relayStats, 'queryAll')
  const spy = subscribeSpyTo(relayStats)
  const spy2 = subscribeSpyTo(relayStats)
  await spy.onComplete()
  await spy2.onComplete()
  expect(queryAllSpy).toHaveBeenCalledTimes(1)
})
