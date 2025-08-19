import { Kind } from '@/constants/kinds'
import { FALLBACK_RELAYS } from '@/constants/relays'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { eventAddress } from '@/utils/nip19'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { NoteState } from '../state/useNote'
import { queryKeys } from './queryKeys'
import type { CustomQueryOptions } from './useQueryBase'
import { eventQueryOptions } from './useQueryBase'

export function eventRepliesQueryOptions(event: NostrEventDB, options?: CustomQueryOptions) {
  const address = eventAddress(event)
  const id = address || event.metadata?.rootId || event.id
  const tagFilter = address ? { '#a': [address] } : { '#e': [event.metadata?.rootId || event.id] }
  return eventQueryOptions({
    queryKey: queryKeys.tag(address ? 'a' : 'e', [id], Kind.Text),
    filter: {
      kinds: [Kind.Text, Kind.Comment],
      ...tagFilter,
    },
    ctx: {
      network: 'STALE_WHILE_REVALIDATE',
      // inbox relays are broken and no one writes to the author inbox, so we have to rely on big relays
      relays: FALLBACK_RELAYS,
      relayHints: {
        idHints: {
          [id]: [event.pubkey],
        },
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

export function useRepliesPubkeys(note: NoteState) {
  const queryClient = useQueryClient()
  const event = note.event
  return useMemo(() => {
    const getChildren = (parentId: string) => {
      return queryClient.getQueryData<NostrEventDB[]>(queryKeys.tag('e', [parentId], Kind.Text)) || []
    }

    const seen = new Set<string>()

    const collectFrom = (parentId: string) => {
      const children = getChildren(parentId)
      if (children.length === 0) {
        return
      }
      for (const child of children) {
        seen.add(child.pubkey)
        collectFrom(child.id)
      }
    }

    const haveDirect = note.replies.data && note.replies.data.length > 0
    if (!haveDirect) {
      return [] as string[]
    }

    collectFrom(event.id)
    return Array.from(seen)
  }, [queryClient, event.id, note.replies.data])
}
