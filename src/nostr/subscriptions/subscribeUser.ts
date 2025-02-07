import { Kind } from '@/constants/kinds'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { ofKind } from '@/core/operators/ofKind'
import { connect, ignoreElements, merge, mergeMap, of, tap } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import { metadataSymbol, type NostrEventUserMetadata } from '../types'
import { subscribeRelayList } from './subscribeRelayList'

const kinds = [Kind.Metadata]

export const replay = new ShareReplayCache<NostrEventUserMetadata>()

export const subscribeUser = (pubkey: string, client: NostrClient, options?: ClientSubOptions) => {
  const relayLists$ = subscribeRelayList(pubkey, client)

  const filter = { kinds, authors: [pubkey] }
  const subOptions = { ...options, relays: of(OUTBOX_RELAYS) }
  const stream$ = client.subscribe(filter, subOptions).pipe(
    ofKind<NostrEventUserMetadata>(kinds),
    connect((shared) => {
      return merge(
        shared,
        shared.pipe(
          tap((event) => client.nip05.enqueue(event[metadataSymbol].nip05)),
          mergeMap((event) => client.nip05.get(event[metadataSymbol].nip05)),
          ignoreElements(),
        ),
      )
    }),
  )
  return merge(stream$, relayLists$.pipe(ignoreElements()))
}
