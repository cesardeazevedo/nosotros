import type { NostrSubscription } from '@/core/NostrSubscription'
import type { NostrEvent } from 'nostr-tools'
import type { ObservableInput } from 'rxjs'
import { distinct, filter, map, pipe } from 'rxjs'

export function distinctEvent(sub: NostrSubscription, flushes?: ObservableInput<unknown>) {
  return pipe(
    distinct(([, event]: [string, NostrEvent]) => event.id, flushes),
    // Filtered out events that were cached
    filter(([, event]: [string, NostrEvent]) => !sub.events.has(event.id)),
    map((data) => data[1]),
  )
}
