import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useMethods } from '@/hooks/useMethods'
import { useCallback } from 'react'
import { useNIP19 } from '../useEventUtils'

export type NoteState = ReturnType<typeof useNoteState>

export type NoteStateToggles = {
  isReplying: boolean
  statsOpen: boolean
  contentOpen: boolean
  repliesOpen: boolean | null
  pageSize: number
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
  toggleStats: (payload?: boolean) => ({
    ...state,
    statsOpen: payload ?? !state.statsOpen,
  }),
  toggleContent: (payload?: boolean) => ({
    ...state,
    contentOpen: payload ?? !state.contentOpen,
  }),
  paginateReplies: (pageSize: number) => ({
    ...state,
    pageSize,
  }),
})

type NoteOptions = {
  contentOpen?: boolean
  repliesOpen?: boolean
  forceSync?: boolean
  replying?: boolean
}

export function useNoteState(event: NostrEventDB, options?: NoteOptions) {
  const [state, actions] = useMethods(createMethods, {
    isReplying: options?.replying ?? false,
    statsOpen: false,
    contentOpen: options?.contentOpen ?? false,
    repliesOpen: (options?.repliesOpen ?? null) as boolean | null,
    pageSize: PAGINATION_SIZE,
  })

  const nip19 = useNIP19(event)

  const { id, metadata } = event

  const paginate = useCallback(
    (offset = PAGINATION_SIZE, max?: number) => {
      actions.paginateReplies(Math.min(max || Infinity, state.pageSize + offset))
    },
    [state, actions.paginateReplies],
  )

  return {
    id,
    event,
    metadata,
    state,
    actions,
    nip19,
    paginate,
  }
}
