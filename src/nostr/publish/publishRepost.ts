import { Kind } from '@/constants/kinds'
import type { PublisherOptions } from '@/core/NostrPublish'
import type { NostrEvent } from 'nostr-tools'
import { publish } from './publish'

export function publishRepost(pubkey: string, event: NostrEvent, options: PublisherOptions) {
  return publish(
    {
      kind: Kind.Repost,
      content: JSON.stringify(event),
      pubkey,
      tags: [
        ['e', event.id],
        ['p', event.pubkey],
      ],
    },
    options,
  )
}
