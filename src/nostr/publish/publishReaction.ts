import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryClient } from '@/hooks/query/queryClient'
import { queryKeys } from '@/hooks/query/queryKeys'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import { tap } from 'rxjs'
import type { LocalPublisherOptions } from './publish'
import { publish } from './publish'

export function publishReaction(pubkey: string, event: NostrEvent, reaction: string, options: LocalPublisherOptions) {
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
  ).pipe(
    tap((reaction) => {
      queryClient.setQueryData(queryKeys.tag('e', [event.id], reaction.kind), (old: NostrEventDB[] = []) => [
        ...old,
        reaction,
      ])
    }),
  )
}
