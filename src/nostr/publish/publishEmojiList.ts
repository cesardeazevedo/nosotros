import { Kind } from '@/constants/kinds'
import { subscribeLastEvent } from '@/hooks/subscriptions/subscribeLast'
import { mergeMap } from 'rxjs'
import type { LocalPublisherOptions } from './publish'
import { publish } from './publish'

export function publishEmojiList(pubkey: string, address: string, options: LocalPublisherOptions) {
  const filter = { kinds: [Kind.Emojis], authors: [pubkey] }
  return subscribeLastEvent({ network: 'REMOTE_ONLY' }, filter).pipe(
    mergeMap((event) => {
      if (!event) {
        return publish(
          {
            kind: Kind.Emojis,
            content: '',
            pubkey,
            tags: [['a', address]],
          },
          options,
        )
      }

      const current = new Set(event.tags.filter(([t]) => t === 'a').map((x) => x[1]))
      const tags = current.has(address)
        ? event.tags.filter((tag) => !(tag[0] === 'a' && tag[1] === address))
        : [...event.tags, ['a', address]]

      return publish(
        {
          kind: Kind.Emojis,
          content: event.content,
          pubkey,
          tags,
        },
        options,
      )
    }),
  )
}
