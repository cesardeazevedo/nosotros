import { Kind } from '@/constants/kinds'
import type { PublisherOptions } from '@/core/NostrPublish'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import { publish } from './publish'

export function publishReaction(pubkey: string, event: NostrEvent, reaction: string, options: PublisherOptions) {
  return publish(
    {
      kind: Kind.Reaction,
      content: reaction,
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
    {
      ...options,
      include: [event],
    },
  )
}
