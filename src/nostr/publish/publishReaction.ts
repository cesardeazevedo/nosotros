import { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { NostrClient } from '../nostr'
import { publish } from './publish'

export function publishReaction(client: NostrClient, event: NostrEvent, reaction: string) {
  return publish(
    client,
    {
      kind: Kind.Reaction,
      content: reaction,
      tags: [
        ['p', event.pubkey],
        ['e', event.id],
      ],
    },
    {
      include: [event],
    },
  )
}
