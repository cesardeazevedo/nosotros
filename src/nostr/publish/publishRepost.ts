import { Kind } from '@/constants/kinds'
import { compactArray } from '@/utils/utils'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import type { LocalPublisherOptions } from './publish'
import { publish } from './publish'

export function publishRepost(event: NostrEvent, options: LocalPublisherOptions) {
  const isAddressable = isParameterizedReplaceableKind(event.kind)
  return publish(
    {
      ...event,
      kind: Kind.Repost,
      content: JSON.stringify(event),
      tags: compactArray([
        ['e', event.id],
        ['p', event.pubkey],
        isAddressable ? ['k', event.kind.toString()] : [],
        isAddressable ? ['a', [event.kind, event.pubkey, event.tags.find((x) => x[0] === 'd')?.[1]].join(':')] : [],
      ]),
    },
    {
      ...options,
      include: [event],
    },
  )
}
