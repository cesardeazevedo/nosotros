import { ofKind } from '@/core/operators/ofKind'
import { ShareReplayCache } from '@/nostr/replay'
import type { NostrEventUserMetadata } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { ignoreElements, merge, tap } from 'rxjs'

const kinds = [Kind.Metadata]

export const replay = new ShareReplayCache<NostrEventUserMetadata>()

export class NIP01Users {
  constructor(private client: NostrClient) {}

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions) => {
    const relayLists$ = this.client.relayList.subscribe(pubkey)

    const stream$ = this.client.subscribe({ kinds, authors: [pubkey] }, options).pipe(
      ofKind<NostrEventUserMetadata>(kinds),
      tap((event) => this.client.dns.enqueue(event[metadataSymbol].nip05)),
    )
    return merge(stream$, relayLists$.pipe(ignoreElements()))
  })
}
