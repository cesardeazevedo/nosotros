import { Kind } from '@/constants/kinds'
import type { PublisherOptions } from '@/core/NostrPublish'
import { EMPTY, mergeMap } from 'rxjs'
import { cacheReplaceablePrune } from '../cache'
import { subscribeLast } from '../subscriptions/subscribeLast'
import { WRITE } from '../types'
import { publish } from './publish'

const kinds = [Kind.Follows]

export function publishFollowList(pubkey: string, tag: 'p', related: string, options: PublisherOptions) {
  const filter = { kinds, authors: [pubkey] }
  cacheReplaceablePrune.delete([Kind.Follows, pubkey].join(':'))
  return subscribeLast(filter, { pubkey, permission: WRITE }).pipe(
    mergeMap((event) => {
      if (!event) return EMPTY // Couldn't find last follows list of the user

      switch (tag) {
        case 'p': {
          // Follows or unfollow the related author
          const authors = new Set(...event.tags.filter((x) => x[0] === 'p').map((x) => x[1]))
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
