import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import { of } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventRelayDiscovery } from '../types'
import { subscribe } from './subscribe'
import { withRelatedAuthors } from './withRelatedAuthor'

const kinds = [Kind.RelayDiscovery]

const relays = [
  'wss://history.nostr.watch',
  'wss://relaypag.es',
  'wss://relay.nostr.watch',
  'wss://monitorlizard.nostr1.com',
]

export function subscribeRelayDiscorvery(ctx: NostrContext) {
  const filter = {
    kinds,
    '#n': ['clearnet'],
  }
  return subscribe(filter, {
    ...ctx,
    subOptions: {
      outbox: false,
      queryLocal: false,
      relays: of(relays),
    },
  }).pipe(ofKind<NostrEventRelayDiscovery>(kinds), withRelatedAuthors({ ...ctx, subOptions: { relays: of(relays) } }))
}
