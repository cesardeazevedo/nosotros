import { STORAGE_DECK_KEY } from '@/constants/storage'
import type { EventModule } from '@/hooks/modules/createEventModule'
import type { MediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import type { NotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import type { Modules } from '@/hooks/modules/module'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { persistentFeedStatesAtom } from './modules.atoms'

export type DeckColumn = FeedModule | NotificationFeedModule | MediaFeedModule | EventModule

export type DeckState = {
  id: string
  name: string
  icon: string
  // option due migration
  columnIds?: string[]
}

export const DEFAULT_DECK = {
  id: 'default',
  name: 'My Deck',
  icon: '🤙',
  columnIds: [],
} as DeckState

export const decksAtom = atomWithStorage<Record<string, DeckState>>(
  STORAGE_DECK_KEY,
  {
    default: DEFAULT_DECK,
  },
  undefined,
  {
    getOnInit: true,
  },
)

export const deckNewPane = atom(false)

export const createDeckAtom = atom(null, (get, set, payload: Omit<DeckState, 'id' | 'columnIds'>) => {
  const id = payload.name.replace(' ', '')
  const decks = get(decksAtom)

  if (decks[id]) {
    return
  }

  set(decksAtom, {
    ...decks,
    [id]: { ...payload, id, columnIds: [] },
  })
})

export const selectDeckAtom = (deckId: string) =>
  atom((get) => {
    const decks = get(decksAtom)
    return decks[deckId] || null
  })

export const addDeckColumnAtom = atom(
  null,
  (get, set, params: { deckId: string; module: Modules; index?: number; replace?: boolean }) => {
    const decks = get(decksAtom)
    const state = decks[params.deckId]
    if (!state) {
      return
    }

    const id = params.module.id + '_' + Math.random().toString().slice(2, 8)
    const newModule = { ...params.module, id }
    const columnIds = state.columnIds?.slice() || []

    if (typeof params.index === 'number' && params.index >= 0 && params.index <= columnIds.length) {
      if (params.replace) {
        columnIds[params.index] = id
      } else {
        columnIds.splice(params.index, 0, id)
      }
    } else {
      columnIds.push(id)
    }

    const persistentModules = get(persistentFeedStatesAtom)
    set(persistentFeedStatesAtom, { ...persistentModules, [id]: newModule })
    set(decksAtom, { ...decks, [params.deckId]: { ...state, columnIds } })
  },
)

export const removeDeckColumnAtom = atom(null, (get, set, args: { deckId: string; id: string }) => {
  const decks = get(decksAtom)
  const deck = decks[args.deckId]

  if (!deck) {
    return
  }

  const columnIds = deck.columnIds?.filter((col) => col !== args.id) || []

  const { [args.id]: _, ...rest } = get(persistentFeedStatesAtom)
  set(persistentFeedStatesAtom, { ...rest })
  set(decksAtom, {
    ...decks,
    [args.deckId]: { ...deck, columnIds },
  })
})
