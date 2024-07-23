import type { NostrEvent, NostrFilter } from 'core/types'
import { matchFilters } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { filter } from 'rxjs'

export function ofFilters(filters: NostrFilter[]): OperatorFunction<[string, NostrEvent], [string, NostrEvent]> {
  return filter(([, event]) => matchFilters(filters, event))
}
