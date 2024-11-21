import { isReplaceable } from '@/core/helpers'
import type { NostrEvent } from 'nostr-tools'

export const cache = new Map<string, boolean>()
export const cacheReplaceablePrune = new Map<string, NostrEvent>()
export const cacheReplaceable = new Map<string, NostrEvent>()

export function clearCache() {
  cache.clear()
  cacheReplaceable.clear()
  cacheReplaceablePrune.clear()
}

export function setCache(event: NostrEvent, prune?: boolean) {
  const { id, kind, pubkey } = event
  cache.set(id, true)
  if (isReplaceable(kind)) {
    cacheReplaceable.set(`${kind}:${pubkey}`, event)
    if (prune) {
      cacheReplaceablePrune.set(`${kind}:${pubkey}`, event)
    }
  }
}

export function hasEventInCache(event: NostrEvent) {
  if (isReplaceable(event.kind)) {
    const found = cacheReplaceable.get(`${event.kind}:${event.pubkey}`)
    return (found?.created_at || 0) >= event.created_at
  }
  return cache.has(event.id)
}
