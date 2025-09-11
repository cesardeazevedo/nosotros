import { STORAGE_DECK_KEY } from '@/constants/storage'
import type { EventModule } from '@/hooks/modules/createEventModule'
import type { MediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import type { NotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type DeckColumn = FeedModule | NotificationFeedModule | MediaFeedModule | EventModule

export type DeckState = {
  id: string
  name: string
  icon: string
  columns: DeckColumn[]
}

export const DEFAULT_DECK = {
  id: 'default',
  name: 'My Deck',
  icon: '🤙',
  columns: [],
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

export const createDeckAtom = atom(null, (get, set, payload: Omit<DeckState, 'id' | 'columns'>) => {
  const id = payload.name.replace(' ', '')
  const decks = get(decksAtom)

  if (decks[id]) {
    return
  }

  set(decksAtom, {
    ...decks,
    [id]: { ...payload, id, columns: [] },
  })
})

export const selectDeckAtom = (deckId: string) =>
  atom((get) => {
    const decks = get(decksAtom)
    return decks[deckId] || null
  })

export const addDeckColumnAtom = atom(
  null,
  (get, set, params: { deckId: string; module: DeckColumn; index?: number; replace?: boolean }) => {
    const decks = get(decksAtom)
    const state = decks[params.deckId]
    if (!state) {
      return
    }

    const newId = params.module.id + Math.random().toString().slice(2, 8)
    const newModule = { ...params.module, id: newId }
    const columns = state.columns.slice()

    if (typeof params.index === 'number' && params.index >= 0 && params.index <= columns.length) {
      if (params.replace) {
        columns[params.index] = newModule
      } else {
        columns.splice(params.index, 0, newModule)
      }
    } else {
      columns.push(newModule)
    }

    set(decksAtom, { ...decks, [params.deckId]: { ...state, columns } })
  },
)

export const updateDeckColumnAtom = atom(null, (get, set, args: { deckId: string; id: string; column: DeckColumn }) => {
  const decks = get(decksAtom)
  const deck = decks[args.deckId]

  if (!deck) {
    return
  }

  const columns = deck.columns.map((col) => {
    if (col.id === args.id) {
      return { ...col, ...args.column }
    }
    return col
  })

  set(decksAtom, {
    ...decks,
    [args.deckId]: { ...deck, columns },
  })
})

export const removeDeckColumnAtom = atom(null, (get, set, args: { deckId: string; id: string }) => {
  const decks = get(decksAtom)
  const deck = decks[args.deckId]

  if (!deck) {
    return
  }

  const columns = deck.columns.filter((col) => col.id !== args.id)

  set(decksAtom, {
    ...decks,
    [args.deckId]: { ...deck, columns },
  })
})
