import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'

export type NoteStatsOptions = {
  zaps?: boolean
  replies?: boolean
  reactions?: boolean
  reposts?: boolean
}

const withKind = (kind: Kind, enabled?: boolean) => (enabled !== false ? [kind] : [])

export function getNoteStatsFilters(event: NostrEvent, options: NoteStatsOptions) {
  const isAddressable = isParameterizedReplaceableKind(event.kind)
  const kinds = [
    ...withKind(Kind.Reaction, options.reactions),
    ...withKind(Kind.Repost, options.reposts),
    ...withKind(Kind.ZapReceipt, options.zaps),
    // we are making an exception to fetch kind1 replies for articles
    ...withKind(Kind.Text, options.replies && (event.kind === Kind.Text || event.kind === Kind.Article)),
    ...withKind(Kind.Comment, options.replies && event.kind !== Kind.Text),
  ].sort()

  const filters = [] as NostrFilter[]

  if (isAddressable) {
    const d = event.tags.find((x) => x[0] === 'd')?.[1]
    if (d) {
      const address = `${event.kind}:${event.pubkey}:${d}`
      filters.push({ kinds: [...kinds, Kind.Comment], '#a': [address] })
    }
  }
  filters.push({ kinds, '#e': [event.id] })
  if (event.kind !== Kind.Text && options?.replies) {
    filters.push({ kinds: [Kind.Comment], '#E': [event.id] })
  }
  return filters
}
