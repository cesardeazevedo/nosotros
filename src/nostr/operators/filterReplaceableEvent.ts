import { isReplaceable } from 'core/helpers'
import type { NostrEvent } from 'core/types'
import { storage } from 'nostr/storage'
import type { OperatorFunction } from 'rxjs'
import { filter, mergeMap, pipe } from 'rxjs'

/**
 * Filter out older replaceable events
 */
export function filterReplaceableEvent(): OperatorFunction<NostrEvent, NostrEvent> {
  return pipe(
    mergeMap(async (event) => {
      if (isReplaceable(event.kind)) {
        const found = await storage.queryEventByPubkey(event.kind, event.pubkey)
        const created_at = found?.created_at || 0
        if (created_at > event.created_at) {
          return false
        }
      }
      return event
    }),
    filter((x) => !!x),
  )
}
