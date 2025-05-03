import { Kind } from '@/constants/kinds'
import type { PublisherOptions } from '@/core/NostrPublish'
import type { NostrEvent } from 'nostr-tools'
import { publish } from './publish'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'

export function publishRepost(pubkey: string, event: NostrEvent, options: PublisherOptions) {
  return publish(
    {
      kind: Kind.Repost,
      content: JSON.stringify(event),
      pubkey,
      tags: [
        ['e', event.id],
        ['p', event.pubkey],
        isParameterizedReplaceableKind(event.kind) ? ['k', event.kind.toString()] : [],
        isParameterizedReplaceableKind(event.kind)
          ? ['a', [event.kind, event.pubkey, event.tags.find((x) => x[0] === 'd')?.[1]].join(':')]
          : [],
      ].filter((x) => x.length >= 2),
    },
    options,
  )
}
