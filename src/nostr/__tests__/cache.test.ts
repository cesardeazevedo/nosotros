import { fakeEvent } from '@/utils/faker'
import { cache, cacheReplaceable, hasEventInCache, setCache } from '../cache'

test('assert cache and cacheReplaceable', () => {
  const event = fakeEvent({ kind: 1, id: '1', pubkey: '1', created_at: 1 })
  const event2 = fakeEvent({ kind: 1, id: '2', pubkey: '1', created_at: 2 })
  const event3 = fakeEvent({ kind: 0, id: '3', pubkey: '1', created_at: 3 })
  const event4 = fakeEvent({ kind: 0, id: '4', pubkey: '1', created_at: 4 })

  expect(hasEventInCache(event)).toBe(false)
  expect(hasEventInCache(event2)).toBe(false)
  expect(hasEventInCache(event3)).toBe(false)
  expect(hasEventInCache(event4)).toBe(false)

  setCache(event, true)
  setCache(event2, true)
  setCache(event3, true)
  setCache(event4, true)

  expect(cache.size).toBe(4)
  expect(cacheReplaceable.size).toBe(1)
  expect(cacheReplaceable.has(`${event4.kind}:${event4.pubkey}`)).toBe(true)

  expect(hasEventInCache(event)).toBe(true)
  expect(hasEventInCache(event2)).toBe(true)
  expect(hasEventInCache(event3)).toBe(false)
  expect(hasEventInCache(event4)).toBe(true)
})
