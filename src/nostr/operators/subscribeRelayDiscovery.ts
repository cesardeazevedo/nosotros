import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import { of } from 'rxjs'
import type { NostrClient } from '../nostr'
import type { NostrEventRelayDiscovery } from '../types'
import { withRelatedAuthors } from '../subscriptions/withRelatedAuthor'

const kinds = [Kind.RelayDiscovery]

export function subscribeRelayDiscorvery(client: NostrClient) {
  return client
    .subscribe(
      {
        kinds,
        '#n': ['clearnet'],
      },
      {
        outbox: false,
        queryLocal: false,
        relays: of([
          'wss://history.nostr.watch',
          'wss://relaypag.es',
          'wss://relay.nostr.watch',
          'wss://monitorlizard.nostr1.com',
        ]),
      },
    )
    .pipe(ofKind<NostrEventRelayDiscovery>(kinds), withRelatedAuthors(client))
}
