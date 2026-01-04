import { replyCountAtomFamily } from '@/atoms/repliesCount.atoms'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '@/hooks/query/queryKeys'
import { appendEventToQuery, setEventData } from '@/hooks/query/queryUtils'
import { buildRepliesQueryOptions, eventRepliesQueryOptions } from '@/hooks/query/useReplies'
import { subscribeLive } from '@/hooks/subscriptions/subscribeLive'
import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily, atomWithObservable } from 'jotai/utils'
import { isAddressableKind } from 'nostr-tools/kinds'
import { from, ignoreElements, mergeMap, tap } from 'rxjs'
import { selectedPubkeyAtom } from './auth.atoms'
import { userFamily } from './users.atoms'

const repliesQueryFamily = atomFamily(
  (params: { event: NostrEventDB }) => {
    const { event } = params
    const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1] || ''
    const address = isAddressableKind(event.kind) ? [event.kind, event.pubkey, dTag].join(':') : undefined
    return atomWithQuery(() => ({
      ...eventRepliesQueryOptions(event, {
        select: (events: NostrEventDB[]) => {
          return events.filter(
            (e) => e.metadata?.parentId === event.id || (address ? e.metadata?.parentId === address : false),
          )
        },
      }),
    }))
  },
  (a, b) => a.event.id === b.event.id,
)

export const liveRepliesFamily = atomFamily(
  (params: { event: NostrEventDB }) => {
    return atomWithObservable(
      () => {
        const scope = 'self'
        const { filters, relayHints } = buildRepliesQueryOptions(params.event)
        return from(filters).pipe(
          mergeMap((filter) => subscribeLive({ relayHints }, scope, filter)),
          tap((event) => {
            setEventData(event)
            if (event.metadata?.rootId) {
              appendEventToQuery(queryKeys.tag('e', [event.metadata.rootId], Kind.Text), [event])
            }
          }),
          ignoreElements(),
        )
      },
      { initialValue: [] as NostrEventDB[] },
    )
  },
  (a, b) => a.event.id === b.event.id,
)

export const repliesFamily = atomFamily(
  (params: { event: NostrEventDB; pageSize?: number }) => {
    return atom((get) => {
      const { event, pageSize = 10 } = params

      const currentPubkey = get(selectedPubkeyAtom)
      const currentUser = get(userFamily({ pubkey: currentPubkey, syncFollows: true }))

      const query = get(repliesQueryFamily({ event }))
      const allReplies = (query.data as NostrEventDB[]) || []

      const muted = allReplies.filter((reply) => {
        const isMutedEvent = currentUser.mutedNotes?.has(reply.id)
        const isMutedAuthor = currentUser.mutedAuthors?.has(reply.pubkey)
        return isMutedEvent || isMutedAuthor
      })

      const sorted = allReplies
        .filter((reply) => {
          const isMutedEvent = currentUser.mutedNotes?.has(reply.id)
          const isMutedAuthor = currentUser.mutedAuthors?.has(reply.pubkey)
          return !isMutedEvent && !isMutedAuthor
        })
        .sort((a, b) => {
          if (a.pubkey === currentUser.pubkey) return -1
          if (b.pubkey === currentUser.pubkey) return 1
          const aFollowed = currentUser.followsTag(a.pubkey)
          const bFollowed = currentUser.followsTag(b.pubkey)
          if (aFollowed && !bFollowed) return -1
          if (!aFollowed && bFollowed) return 1
          return 0
        })

      const total = get(replyCountAtomFamily(event.id))
      const chunk = sorted.slice(0, pageSize)
      const preview = allReplies.filter((e) => currentUser.followsTag(e.pubkey)).slice(0, 2)
      const previewByUser = (pubkey?: string) => {
        if (pubkey) {
          return allReplies.filter((event) => event.pubkey === pubkey).slice(0, 2)
        }
        return preview
      }

      return {
        query,
        sorted,
        chunk,
        muted,
        preview,
        previewByUser,
        total,
      }
    })
  },
  (a, b) => a.event.id === b.event.id && a.pageSize === b.pageSize,
)
