import { Kind } from '@/constants/kinds'
import { subscribeLastEvent } from '@/hooks/subscriptions/subscribeLast'
import { EMPTY, mergeMap } from 'rxjs'
import { isAuthorTag } from '../../hooks/parsers/parseTags'
import type { LocalPublisherOptions } from './publish'
import { publish } from './publish'

const kinds = [Kind.Follows]

export function publishFollowList(pubkey: string, tag: 'p', related: string[], options: LocalPublisherOptions) {
  const filter = { kinds, authors: [pubkey] }
  return subscribeLastEvent({ network: 'REMOTE_ONLY' }, filter).pipe(
    mergeMap((event) => {
      if (!event) return EMPTY // Couldn't find last follows list of the user

      switch (tag) {
        case 'p': {
          // Follows or unfollow the related author
          const authors = new Set(event.tags.filter(isAuthorTag).map((x) => x[1]))
          const tags = (
            related.length === 1 && authors.has(related[0])
              ? event.tags.filter((pubkey) => pubkey[1] !== related[0])
              : [...event.tags, ...related.filter((pubkey) => !authors.has(pubkey)).map((pubkey) => ['p', pubkey])]
          ).filter((tag) => {
            // Remove bad stuff from p tags
            if (tag[0] === 'p' && import.meta.env.MODE !== 'test') {
              return tag[1].length === 64
            }
            return true
          })

          return publish(
            {
              kind: Kind.Follows,
              content: event.content,
              pubkey,
              tags,
            },
            options,
          )
        }
        // todo: other tags to follow (topics)
        default: {
          return EMPTY
        }
      }
    }),
  )
}
