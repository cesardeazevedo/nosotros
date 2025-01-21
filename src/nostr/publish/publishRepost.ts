import { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { NostrClient } from '../nostr'
import { publish } from './publish'

export function publishRepost(client: NostrClient, event: NostrEvent) {
  return publish(client, {
    kind: Kind.Repost,
    content: JSON.stringify(event),
    tags: [
      ['e', event.id],
      ['p', event.pubkey],
    ],
  })
}
