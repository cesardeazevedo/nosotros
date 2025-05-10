import { Kind } from '@/constants/kinds'
import type { PublisherOptions } from '@/core/NostrPublish'
import { EMPTY, mergeMap } from 'rxjs'
import { cacheReplaceablePrune } from '../cache'
import { isAuthorTag } from '../helpers/parseTags'
import { subscribeLast } from '../subscriptions/subscribeLast'
import { WRITE } from '../types'
import { publish } from './publish'

const kinds = [Kind.Follows]

export function publishFollowList(pubkey: string, tag: 'p', related: string[], options: PublisherOptions) {
  const filter = { kinds, authors: [pubkey] }
  cacheReplaceablePrune.delete([Kind.Follows, pubkey].join(':'))
  return subscribeLast(filter, { pubkey, permission: WRITE }).pipe(
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
