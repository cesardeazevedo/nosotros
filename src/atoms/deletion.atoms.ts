import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '@/hooks/query/queryKeys'
import { eventQueryOptions } from '@/hooks/query/useQueryBase'
import { atom } from 'jotai'
import { withAtomEffect } from 'jotai-effect'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'

const deletedEventsAtom = atom(new Set<string>())

export const userRequestDeletesQueryFamily = atomFamily(
  (pubkey: string | undefined) => {
    const queryAtom = atomWithQuery(() => ({
      ...eventQueryOptions<NostrEventDB[]>({
        queryKey: queryKeys.author(pubkey || '', Kind.EventDeletion),
        filter: {
          kinds: [Kind.EventDeletion],
          authors: pubkey ? [pubkey] : [],
        },
        enabled: !!pubkey,
        ctx: {
          network: 'STALE_WHILE_REVALIDATE',
        },
      }),
    }))

    return withAtomEffect(queryAtom, (get, set) => {
      const query = get(queryAtom)
      const events = query.data as NostrEventDB[] | undefined
      if (events?.length) {
        set(addDeletionEventsAtom, events)
      }
    })
  },
  (a, b) => a === b,
)

export const addDeletionEventsAtom = atom(
  null,
  (get, set, events: NostrEventDB[]) => {
    const nextStore = new Set(get(deletedEventsAtom))

    for (const event of events) {
      if (event.kind !== 5) continue
      for (const tag of event.tags) {
        const tagName = tag[0]
        const tagValue = tag[1]
        if ((tagName === 'e' || tagName === 'a') && tagValue) {
          nextStore.add(tagValue)
        }
      }
    }

    set(deletedEventsAtom, nextStore)
  },
)

export const isDeletedEventAtomFamily = atomFamily(
  (eventRef: string | undefined) =>
    atom((get) => {
      const state = get(deletedEventsAtom)
      return !!eventRef && state.has(eventRef)
    }),
  (a, b) => a === b,
)
