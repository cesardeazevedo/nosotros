import { Kind } from '@/constants/kinds'
import { FALLBACK_RELAYS } from '@/constants/relays'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { eventAddress } from '@/utils/nip19'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import type { CustomQueryOptions } from './useQueryBase'
import { eventQueryOptions } from './useQueryBase'

export function eventRepliesQueryOptions(event: NostrEventDB, options?: CustomQueryOptions) {
  const isComment = event.kind !== Kind.Text
  const address = eventAddress(event)
  const rootId = address || event.metadata?.rootId || event.id
  const ids = [address, event.metadata?.rootId, event.id].filter((x): x is string => !!x)
  const noteFilter = isComment ? { '#E': ids } : { '#e': ids }
  const addressFilter = address ? { '#a': [address] } : {}
  const filter = { ...noteFilter, ...addressFilter }
  return eventQueryOptions({
    queryKey: queryKeys.tag(address ? 'a' : 'e', [rootId], Kind.Text),
    filter: {
      kinds: [Kind.Text, Kind.Comment],
      ...filter,
    },
    ctx: {
      network: 'STALE_WHILE_REVALIDATE',
      // inbox relays are broken and no one writes to the author inbox, so we have to rely on big relays
      relays: FALLBACK_RELAYS,
      relayHints: {
        idHints: ids.reduce((acc, id) => ({ ...acc, [id]: [event.pubkey] }), {}),
      },
    },
    ...options,
  })
}

export function eventRepliesByIdQueryOptions(id: string, options?: CustomQueryOptions) {
  return eventQueryOptions({
    queryKey: queryKeys.tag('e', [id], Kind.Text),
    filter: {
      kinds: [Kind.Text, Kind.Comment],
      '#e': [id],
    },
    ctx: {
      network: 'STALE_WHILE_REVALIDATE_BATCH',
      ...options?.ctx,
      relayHints: {
        ids: {
          [id]: FALLBACK_RELAYS,
        },
      },
    },
    ...options,
  })
}

export function useEventReplies(event: NostrEventDB, options?: CustomQueryOptions) {
  return useQuery(eventRepliesQueryOptions(event, options))
}
