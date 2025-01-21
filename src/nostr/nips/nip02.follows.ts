import { ofKind } from '@/core/operators/ofKind'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { connect, from, ignoreElements, merge, mergeMap } from 'rxjs'
import { ShareReplayCache } from '../replay'
import type { NostrEventFollow } from '../types'
import { metadataSymbol } from '../types'

export const replay = new ShareReplayCache<NostrEventFollow>()

const kinds = [Kind.Follows]

export class NIP02Follows {
  constructor(private client: NostrClient) {}

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions) => {
    return this.client.subscribe({ kinds, authors: [pubkey] }, options).pipe(
      ofKind<NostrEventFollow>(kinds),

      connect((shared$) => {
        return merge(
          shared$,
          shared$.pipe(
            mergeMap((event) =>
              from(event[metadataSymbol].tags.get('p') || []).pipe(
                mergeMap((pubkey) => this.client.users.subscribe(pubkey)),
              ),
            ),
            ignoreElements(),
          ),
        )
      }),
    )
  })
}
