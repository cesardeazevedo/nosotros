import { isAddressableKind, isReplaceableKind } from 'nostr-tools/kinds'
import type { NostrEventDB } from './sqlite.types'

export function filterOlderReplaceableEvents(events: NostrEventDB[]) {
  const filtered: NostrEventDB[] = []
  const replaceableMap = new Map<string, NostrEventDB>()
  const parameterizedMap = new Map<string, NostrEventDB>()

  for (const event of events) {
    if (isReplaceableKind(event.kind)) {
      const key = [event.kind, event.pubkey].join(':')
      const existing = replaceableMap.get(key)

      if (!existing || existing.created_at < event.created_at) {
        replaceableMap.set(key, event)
      }
    } else if (isAddressableKind(event.kind)) {
      const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
      if (!dTag) {
        continue
      }

      const key = [event.kind, event.pubkey, dTag].join(':')
      const existing = parameterizedMap.get(key)

      if (!existing || existing.created_at < event.created_at) {
        parameterizedMap.set(key, event)
      }
    } else {
      filtered.push(event)
    }
  }

  filtered.push(...replaceableMap.values())
  filtered.push(...parameterizedMap.values())
  return filtered
}
