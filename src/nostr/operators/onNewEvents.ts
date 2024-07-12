import type { NostrSubscription } from 'core/NostrSubscription'
import { validateNostrEvent } from 'core/operators/validateNostrEvent'
import type { NostrEvent } from 'core/types'
import { matchFilters } from 'nostr-tools'
import { filterReplaceableEvent } from 'nostr/operators/filterReplaceableEvent'
import { filter, pipe, type OperatorFunction } from 'rxjs'
import { hasEventInStore } from 'stores/operators/hasEventInStore'
import { distinctEvent } from './distinctEvents'

export function onNewEvents(sub: NostrSubscription): OperatorFunction<[string, NostrEvent], NostrEvent> {
  return pipe(
    filter(([, event]) => matchFilters(sub.filters, event)),

    distinctEvent(),

    filterReplaceableEvent(),

    filter((event) => !hasEventInStore(event)),

    validateNostrEvent(),
  )
}
