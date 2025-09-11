import { Kind } from '@/constants/kinds'
import { subscribeLastEvent } from '@/hooks/subscriptions/subscribeLast'
import { EMPTY, mergeMap } from 'rxjs'
import type { LocalPublisherOptions } from './publish'
import { publish } from './publish'

const kinds = [Kind.Follows]

export function publishFollowList(pubkey: string, tag: string, newValues: string[], options: LocalPublisherOptions) {
  const filter = { kinds, authors: [pubkey] }
  return subscribeLastEvent({ network: 'REMOTE_ONLY' }, filter).pipe(
    mergeMap((event) => {
      if (!event) return EMPTY // Couldn't find last follows list of the user

      const values = new Set(event.tags.filter(([t]) => t === tag).map((x) => x[1]))
      const tags = (
        newValues.length === 1 && values.has(newValues[0])
          ? event.tags.filter((tag) => tag[1] !== newValues[0])
          : [...event.tags, ...newValues.filter((value) => !values.has(value)).map((value) => [tag, value])]
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
    }),
  )
}
