import { childrenAtomFamily } from '@/atoms/repliesCount.atoms'
import { liveRepliesFamily, repliesFamily } from '@/atoms/repliesQuery.atoms'
import { store } from '@/atoms/store'
import { Kind } from '@/constants/kinds'
import { FALLBACK_RELAYS } from '@/constants/relays'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { eventAddress } from '@/utils/nip19'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { batcherReplies } from '../batchers'
import { queryClient } from './queryClient'
import { queryKeys } from './queryKeys'
import type { CustomQueryOptions } from './useQueryBase'
import { eventQueryOptions } from './useQueryBase'

export function buildRepliesQueryOptions(event: NostrEventDB) {
  const address = eventAddress(event)
  const rootId = address || event.metadata?.rootId || event.id
  const ids = [event.metadata?.rootId, event.id].filter((x): x is string => !!x)

  const isNonText = event.kind !== Kind.Text

  const kinds = [Kind.Text, Kind.Comment]
  const filters: NostrFilter[] = [{ kinds, "#e": ids }]
  if (isNonText) {
    filters.push({ kinds, "#E": ids })
  }
  if (address) {
    filters.push(...[
      { kinds, '#A': [address] },
      { kinds, '#a': [address] },
    ])
  }

  const queryKey = queryKeys.tag(address ? 'a' : 'e', [rootId], Kind.Text)

  const idHintsIds = address ? [address, ...ids] : ids
  const relayHints = mergeRelayHints([
    event.metadata?.relayHints || {},
    {
      idHints: idHintsIds.reduce((acc, id) => ({ ...acc, [id]: [event.pubkey] }), {}),
    },
  ])

  return { queryKey, filters, relayHints }
}

export function eventRepliesQueryOptions(event: NostrEventDB, options?: CustomQueryOptions) {
  const { queryKey, filters, relayHints } = buildRepliesQueryOptions(event)
  return eventQueryOptions({
    queryKey,
    filters,
    ...options,
    ctx: {
      batcher: batcherReplies,
      subId: 'replies',
      network: 'STALE_WHILE_REVALIDATE_BATCH',
      // inbox relays are broken and no one writes to the author inbox, so we have to rely on big relays
      relays: FALLBACK_RELAYS,
      relayHints,
      ...options?.ctx,
    },
  })
}

export function useEventReplies(event: NostrEventDB, options?: { pageSize?: number }) {
  return useAtomValue(repliesFamily({ event, pageSize: options?.pageSize }))
}

export function useLiveReplies(event: NostrEventDB) {
  return useAtomValue(liveRepliesFamily({ event }))
}

export function useRepliesPubkeys(event: NostrEventDB) {
  const replies = useEventReplies(event)
  return useMemo(() => {
    const collected = new Set<string>()
    const visited = new Set<string>()

    const walk = (id: string) => {
      if (visited.has(id)) {
        return
      }
      visited.add(id)

      const children = [...store.get(childrenAtomFamily(id))]
      for (const childId of children) {
        const childEntry = queryClient.getQueryData<NostrEventDB[] | NostrEventDB>(queryKeys.event(childId))
        const child = Array.isArray(childEntry) ? childEntry[0] : childEntry
        if (child?.pubkey) {
          collected.add(child.pubkey)
        }
        walk(childId)
      }
    }

    // include direct replies from query while walking descendants from atoms graph
    for (const reply of replies.query.data || []) {
      collected.add(reply.pubkey)
    }
    walk(event.id)

    return [...collected]
  }, [event.id, replies.query.data, replies.total])
}

export function invalidateReplies(event: NostrEventDB) {
  const { queryKey } = buildRepliesQueryOptions(event)
  queryClient.invalidateQueries({ queryKey })
}
