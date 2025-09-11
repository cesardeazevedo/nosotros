import { Kind } from '@/constants/kinds'
import { subscribeLastEvent } from '@/hooks/subscriptions/subscribeLast'
import { EMPTY, mergeMap } from 'rxjs'
import type { LocalPublisherOptions } from './publish'
import { publish } from './publish'

export function publishBookmark(pubkey: string, eventId: string, options: LocalPublisherOptions) {
  const filter = { kinds: [Kind.BookmarkList], authors: [pubkey] }
  return subscribeLastEvent({ network: 'REMOTE_ONLY' }, filter).pipe(
    mergeMap((event) => {
      if (!event) return EMPTY

      const current = new Set(event.tags.filter(([t]) => t === 'e').map((x) => x[1]))
      const tags = current.has(eventId)
        ? event.tags.filter((tag) => !(tag[0] === 'e' && tag[1] === eventId))
        : [...event.tags, ['e', eventId]]

      return publish(
        {
          kind: Kind.BookmarkList,
          content: event.content,
          pubkey,
          tags,
        },
        options,
      )
    }),
  )
}
