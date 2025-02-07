import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import { start } from '@/core/operators/start'
import { EMPTY, last, map, mergeMap, of } from 'rxjs'
import { cacheReplaceablePrune } from '../cache'
import type { NostrClient } from '../nostr'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { createSubscription } from '../subscriptions/createSubscription'
import type { NostrEventFollow } from '../types'
import { metadataSymbol } from '../types'
import { publish } from './publish'

const kinds = [Kind.Follows]

export function publishFollowList(client: NostrClient, tag: 'p', related: string) {
  if (!client.pubkey) return EMPTY

  const filter = { kinds, authors: [client.pubkey] }
  cacheReplaceablePrune.delete(`${Kind.Follows}:${client.pubkey}`)
  const sub = createSubscription(filter, client, { queryLocal: false })
  return of(sub).pipe(
    start(client.pool),
    map(([, event]) => event),
    parseEventMetadata(),
    ofKind<NostrEventFollow>(kinds),
    last(undefined, null),
    mergeMap((event) => {
      if (!event) return EMPTY

      const metadata = event[metadataSymbol]
      switch (tag) {
        case 'p': {
          // Follows or unfollow the related author
          const authors = metadata.tags.get('p') || new Set()
          const tags = (
            authors.has(related)
              ? event.tags.filter((pubkey) => pubkey[1] !== related)
              : [...event.tags, ['p', related]]
          ).filter((tag) => {
            // Remove bad stuff from p tags
            if (tag[0] === 'p') {
              return tag[1].length === 64
            }
            return true
          })

          return publish(client, {
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
    }),
  )
}
