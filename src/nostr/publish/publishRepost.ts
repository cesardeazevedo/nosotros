import { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { NostrContext } from '../context'
import { publish } from './publish'

export function publishRepost(ctx: NostrContext, event: NostrEvent) {
  return publish(ctx, {
    kind: Kind.Repost,
    content: JSON.stringify(event),
    tags: [
      ['e', event.id],
      ['p', event.pubkey],
    ],
  })
}
