import type { NostrEvent } from 'nostr-tools'
import { isReplaceableKind } from 'nostr-tools/kinds'

export const cache = new Map<string, NostrEvent>()
export const cacheReplaceablePrune = new Map<string, NostrEvent>()
export const cacheReplaceable = new Map<string, NostrEvent>()

export function clearCache() {
  cache.clear()
  cacheReplaceable.clear()
  cacheReplaceablePrune.clear()
}

export function setCache(event: NostrEvent, prune?: boolean) {
  const { id, kind, pubkey } = event
  cache.set(id, event)
  if (isReplaceableKind(kind)) {
    cacheReplaceable.set(`${kind}:${pubkey}`, event)
    if (prune) {
      cacheReplaceablePrune.set(`${kind}:${pubkey}`, event)
    }
  }
}

export function hasEventInCache(event: NostrEvent) {
  if (isReplaceableKind(event.kind)) {
    const found = cacheReplaceable.get(`${event.kind}:${event.pubkey}`)
    return (found?.created_at || 0) >= event.created_at
  }
  return cache.has(event.id)
}
