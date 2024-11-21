import { Kind } from 'constants/kinds'
import type { NostrClient, ClientSubOptions } from 'nostr/nostr'
import { connect, from, ignoreElements, map, merge, mergeMap, tap } from 'rxjs'
import { Follows } from 'stores/models/follow'
import { followsStore } from 'stores/nostr/follows.store'
import { ShareReplayCache } from '../replay'

export const replay = new ShareReplayCache<Follows>()

export class NIP02Follows {
  constructor(private client: NostrClient) {}

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions) => {
    return this.client.subscribe({ kinds: [Kind.Follows], authors: [pubkey] }, options).pipe(
      map((event) => new Follows(event)),

      connect((shared$) => {
        return merge(
          shared$,
          shared$.pipe(
            mergeMap((data) => from([...data.authors]).pipe(mergeMap((pubkey) => this.client.users.subscribe(pubkey)))),
            ignoreElements(),
          ),
        )
      }),

      tap((follows: Follows) => followsStore.add(follows)),
    )
  })
}
