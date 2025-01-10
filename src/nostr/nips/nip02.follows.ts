import { ofKind } from '@/core/operators/ofKind'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { connect, EMPTY, from, ignoreElements, last, merge, mergeMap } from 'rxjs'
import { ShareReplayCache } from '../replay'
import type { NostrEventFollow } from '../types'
import { metadataSymbol } from '../types'

export const replay = new ShareReplayCache<NostrEventFollow>()

const kinds = [Kind.Follows]

export class NIP02Follows {
  constructor(private client: NostrClient) {}

  publish(tag: 'p', pubkey: string, related: string) {
    // Always get the latest follows list (without cache) before modifying it
    return this.subscribe(pubkey, { queryLocal: false }).pipe(
      last(undefined, null),
      mergeMap((event) => {
        if (event) {
          const metadata = event[metadataSymbol]
          switch (tag) {
            case 'p': {
              // Follows or unfollow the related author
              const authors = metadata.tags.get('p') || new Set()
              const tags = authors.has(related)
                ? event.tags.filter((pubkey) => pubkey[1] !== related)
                : [...event.tags, ['p', related]]
              return this.client.publish({
                kind: Kind.Follows,
                content: event.content,
                tags,
              })
            }
            // todo: other tags to follow (topics)
            default: {
              return EMPTY
            }
          }
        }
        return EMPTY
      }),
    )
  }

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
