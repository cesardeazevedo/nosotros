import type { NostrSubscription } from '@/core/NostrSubscription'
import type { NostrEvent } from 'nostr-tools'
import { distinct, filter, map, pipe } from 'rxjs'

export function distinctEvent(sub: NostrSubscription) {
  return pipe(
    distinct(([, event]: [string, NostrEvent]) => event.id),
    // Filtered out events that were cached
    filter(([, event]: [string, NostrEvent]) => !sub.events.has(event.id)),
    map((data) => data[1]),
  )
}
