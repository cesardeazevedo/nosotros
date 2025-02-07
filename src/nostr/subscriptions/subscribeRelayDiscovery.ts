import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import { of } from 'rxjs'
import type { NostrClient } from '../nostr'
import type { NostrEventRelayDiscovery } from '../types'
import { withRelatedAuthors } from './withRelatedAuthor'

const kinds = [Kind.RelayDiscovery]

const relays = [
  'wss://history.nostr.watch',
  'wss://relaypag.es',
  'wss://relay.nostr.watch',
  'wss://monitorlizard.nostr1.com',
]

export function subscribeRelayDiscorvery(client: NostrClient) {
  const filter = {
    kinds,
    '#n': ['clearnet'],
  }
  return client
    .subscribe(filter, {
      outbox: false,
      queryLocal: false,
      relays: of(relays),
    })
    .pipe(ofKind<NostrEventRelayDiscovery>(kinds), withRelatedAuthors(client, { relays: of(relays) }))
}
