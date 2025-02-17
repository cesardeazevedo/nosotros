import { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { NostrContext } from '../context'
import { publish } from './publish'

export function publishReaction(ctx: NostrContext, event: NostrEvent, reaction: string) {
  return publish(
    ctx,
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
