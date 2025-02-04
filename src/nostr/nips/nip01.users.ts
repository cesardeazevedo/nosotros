import { OUTBOX_RELAYS } from '@/constants/relays'
import { ofKind } from '@/core/operators/ofKind'
import { ShareReplayCache } from '@/nostr/replay'
import type { NostrEventUserMetadata } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { connect, ignoreElements, merge, mergeMap, of, tap } from 'rxjs'

const kinds = [Kind.Metadata]

export const replay = new ShareReplayCache<NostrEventUserMetadata>()

export class NIP01Users {
  constructor(private client: NostrClient) {}

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions) => {
    const relayLists$ = this.client.relayList.subscribe(pubkey)

    const stream$ = this.client.subscribe({ kinds, authors: [pubkey] }, { ...options, relays: of(OUTBOX_RELAYS) }).pipe(
      ofKind<NostrEventUserMetadata>(kinds),
      connect((shared) => {
        return merge(
          shared,
          shared.pipe(
            tap((event) => this.client.dns.enqueue(event[metadataSymbol].nip05)),
            mergeMap((event) => this.client.dns.get(event[metadataSymbol].nip05)),
            ignoreElements(),
          ),
        )
      }),
    )
    return merge(stream$, relayLists$.pipe(ignoreElements()))
  })
}
