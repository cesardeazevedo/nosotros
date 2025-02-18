import type { NostrEvent } from 'nostr-tools'
import type { Relay } from '../Relay'
import { ClientToRelay } from '../types'

export function auth(relay: Relay, event: NostrEvent) {
  relay.websocket$.next([ClientToRelay.AUTH, event] as never)
  return relay.websocket$
}
