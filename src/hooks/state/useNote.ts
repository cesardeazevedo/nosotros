import { replyCountAtomFamily } from '@/atoms/replies.atoms'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useMethods } from '@/hooks/useMethods'
import type { NostrContext } from '@/nostr/context'
import { useAtomValue } from 'jotai'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import { useCallback, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useEventMetadata } from '../query/useQueryUser'
import { useReactions } from '../query/useReactions'
import { useEventReplies } from '../query/useReplies'
import { useReposts } from '../query/useReposts'
import { useSeen } from '../query/useSeen'
import { useZaps } from '../query/useZaps'
import { useCurrentPubkey, useCurrentUser } from '../useAuth'
import { useEventDTag, useNaddress, useNevent } from '../useEventUtils'

export type NoteState = ReturnType<typeof useNoteState>

export type NoteStateToggles = {
  isReplying: boolean
  broadcastOpen: boolean
  contentOpen: boolean
  repliesOpen: boolean | null
  limit: number
}

const PAGINATION_SIZE = 10

const createMethods = (state: NoteStateToggles) => ({
  toggleReplying: (payload?: boolean) => ({
    ...state,
    isReplying: payload ?? !state.isReplying,
  }),
  toggleReplies: (payload?: boolean | null) => ({
    ...state,
    repliesOpen: payload ?? !state.repliesOpen,
  }),
  toggleBroadcast: (payload?: boolean) => ({
    ...state,
    broadcastOpen: payload ?? !state.broadcastOpen,
  }),
  toggleContent: (payload?: boolean) => ({
    ...state,
    contentOpen: payload ?? !state.contentOpen,
  }),
  paginateReplies: (payload?: number) => ({
    ...state,
    limit: state.limit + (payload ?? PAGINATION_SIZE),
  }),
})

type NoteOptions = {
  repliesOpen?: boolean
  forceSync?: boolean
}

export function useNoteState(event: NostrEventDB, options?: NoteOptions) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    initialInView: false,
  })

  const [state, actions] = useMethods(createMethods, {
    isReplying: false,
    broadcastOpen: false,
    contentOpen: options?.repliesOpen ?? false,
    repliesOpen: (options?.repliesOpen ?? null) as boolean | null,
    limit: PAGINATION_SIZE,
  })

  const [limit, setLimit] = useState(PAGINATION_SIZE)
  const currentLoggedPubkey = useCurrentPubkey()

  const ctx = {
    relayHints: {
      idHints: {
        [event.id]: [event.pubkey, ...[currentLoggedPubkey ? currentLoggedPubkey : []]],
      },
    },
  } as NostrContext

  const queryOptions = { ctx, enabled: options?.forceSync || inView }

  const user = useEventMetadata(event.pubkey, queryOptions)

  const zaps = useZaps(event, queryOptions)
  const reposts = useReposts(event, queryOptions)
  const reactions = useReactions(event, queryOptions)

  const nevent = useNevent(event)
  const naddress = useNaddress(event)
  const currentUser = useCurrentUser()

  const { id, metadata } = event
  const dTag = useEventDTag(event)
  const address = isParameterizedReplaceableKind(event.kind) ? [event.kind, event.pubkey, dTag].join(':') : undefined

  const replies = useEventReplies(event, {
    enabled: queryOptions.enabled,
    select: (events: NostrEventDB[]) => {
      return events.filter(
        (e) => e.metadata?.parentId === event.id || (address ? e.metadata?.parentId === address : false),
      )
    },
  })

  const repliesSorted = useMemo(() => {
    const { data = [] } = replies
    return data
      .filter((reply) => {
        const isMutedEvent = currentUser?.mutedNotes?.has(reply.id)
        const isMutedAuthor = currentUser?.mutedAuthors?.has(reply.pubkey)
        return !isMutedEvent && !isMutedAuthor
      })
      .sort((a) => (currentUser?.followsPubkey(a.pubkey) ? -1 : 1))
      .sort((a) => (a.pubkey === currentUser?.pubkey ? -1 : 1))
  }, [replies.data])

  // this needs some work
  const repliesMuted = useMemo(() => {
    return replies.data?.filter((reply) => {
      const isMutedEvent = currentUser?.mutedNotes?.has(reply.id)
      const isMutedAuthor = currentUser?.mutedAuthors?.has(reply.pubkey)
      return isMutedEvent || isMutedAuthor
    })
  }, [replies.data])

  const repliesChunk = useMemo(() => repliesSorted.slice(0, limit), [repliesSorted, limit])

  const repliesPreview = useMemo(() => {
    return replies.data?.filter((event) => currentUser?.followsPubkey(event.pubkey)).slice(0, 2) || []
  }, [replies.data])

  // Get preview replies from a single user
  const getRepliesPreviewUser = useCallback(
    (pubkey?: string) => {
      if (pubkey) {
        return replies.data?.filter((event) => event.pubkey === pubkey).slice(0, 2) || []
      }
      return repliesPreview
    },
    [replies.data, repliesPreview],
  )

  const repliesTotal = useAtomValue(replyCountAtomFamily(event.id))

  const paginate = useCallback(
    (offset = PAGINATION_SIZE) => {
      setLimit((prev) => Math.min(replies.data?.length || Infinity, prev + offset))
    },
    [replies.data],
  )

  const zapAmount = useMemo(() => {
    const { data = [] } = zaps
    return (
      data
        .flatMap((event) => event.metadata?.bolt11)
        .reduce((acc, current) => {
          const amount = parseInt(current?.amount?.value || '0')
          return acc + amount
        }, 0) / 1000
    )
  }, [zaps.data])

  const seen = useSeen(id, { enabled: queryOptions.enabled })
  const seenOn = useMemo(() => seen.data?.map((s) => s.relay) || [], [seen.data])

  return {
    id,
    event,
    metadata,
    state,
    actions,
    ref,
    inView,
    user,

    nip19: isParameterizedReplaceableKind(event.kind) ? naddress : nevent,

    reposts,
    reactions,
    zaps,
    zapAmount,

    replies,
    repliesSorted,
    repliesChunk,
    repliesTotal,
    repliesMuted,
    getRepliesPreviewUser,
    paginate,
    seenOn,
  }
}
