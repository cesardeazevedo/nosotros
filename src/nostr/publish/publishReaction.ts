import { Kind } from '@/constants/kinds'
import type { PublisherOptions } from '@/core/NostrPublish'
import type { NostrEvent } from 'nostr-tools'
import { publish } from './publish'

export function publishReaction(pubkey: string, event: NostrEvent, reaction: string, options: PublisherOptions) {
  return publish(
    {
      kind: Kind.Reaction,
      content: reaction,
      pubkey,
      tags: [
        ['p', event.pubkey],
        ['e', event.id],
      ],
    },
    {
      ...options,
      include: [event],
    },
  )
}
