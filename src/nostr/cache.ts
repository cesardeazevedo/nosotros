import { LRUCache } from 'lru-cache'

type EventCache = LRUCache.Options<string, boolean, unknown>

export const cache = new LRUCache({ max: 10000 }) satisfies EventCache
export const cacheRelayList = new LRUCache({ max: 10000 }) satisfies EventCache
