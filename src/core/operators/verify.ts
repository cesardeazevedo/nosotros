import type { NostrEvent } from 'core/types'
import type { UnsignedEvent, VerifiedEvent } from 'nostr-tools'
import { verifyEvent } from 'nostr-tools'
import { filter } from 'rxjs'

/**
 * Filter out invalid events and invalid signatures
 */
export function verify() {
  return filter((event: NostrEvent | UnsignedEvent): event is VerifiedEvent => {
    return verifyEvent(event as NostrEvent)
  })
}
