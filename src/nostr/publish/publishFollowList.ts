import { Kind } from '@/constants/kinds'
import { EMPTY, last, mergeMap } from 'rxjs'
import type { NostrClient } from '../nostr'
import { metadataSymbol } from '../types'
import { publish } from './publish'

export function publishFollowList(client: NostrClient, tag: 'p', related: string) {
  if (!client.pubkey) return EMPTY

  // Always get the latest follows list (without cache) before modifying it
  return client.follows.subscribe(client.pubkey, { queryLocal: false }).pipe(
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
