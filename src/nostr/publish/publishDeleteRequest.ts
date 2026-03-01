import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { getUserRelays } from '@/hooks/query/useQueryUser'
import { READ } from '@/nostr/types'
import { getDTag } from '@/utils/nip19'
import { isAddressableKind } from 'nostr-tools/kinds'
import type { LocalPublisherOptions } from './publish'
import { publish } from './publish'

export function publishDeleteRequest(pubkey: string, target: NostrEventDB, options: LocalPublisherOptions) {
  const pTagPubkeys = [...new Set((target.tags || []).filter((tag) => tag[0] === 'p' && !!tag[1]).map((tag) => tag[1]))]
  const includeRelays = [
    ...new Set([...(options.includeRelays || []), ...pTagPubkeys.flatMap((p) => getUserRelays(p, READ))]),
  ]

  const kTag: string[] = ['k', String(target.kind)]
  const tags: string[][] = (() => {
    if (isAddressableKind(target.kind)) {
      const dTag = getDTag(target)
      if (dTag) {
        return [['a', `${target.kind}:${target.pubkey}:${dTag}`], kTag]
      }
    }
    return [['e', target.id], kTag]
  })()

  return publish(
    {
      kind: Kind.EventDeletion,
      pubkey,
      tags,
      content: '',
    },
    {
      ...options,
      includeRelays,
      include: [target],
    },
  )
}
