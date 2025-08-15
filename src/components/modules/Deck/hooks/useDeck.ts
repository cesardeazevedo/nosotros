import type { DeckColumn } from '@/atoms/deck.atoms'
import { addDeckColumnAtom, deckNewPane, decksAtom, DEFAULT_DECK, removeDeckColumnAtom } from '@/atoms/deck.atoms'
import { useParams } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { useContext } from 'use-context-selector'
import { DeckColumnContext } from '../DeckContext'

export function useDecks() {
  const decks = useAtomValue(decksAtom)
  return Object.values(decks)
}

export function useDeck() {
  const id = useParams({ from: '/deck/$id', shouldThrow: false })?.id
  const decks = useAtomValue(decksAtom)
  return decks[id || ''] || DEFAULT_DECK
}

export function useDeckColumn() {
  return useContext(DeckColumnContext)
}

const REPLACEABLE_COLUMNS = ['event', 'relayfeed']

export function useDeckAddNextColumn(createModule: () => DeckColumn) {
  const deck = useDeck()
  const deckId = deck!.id
  const addDeckColumn = useSetAtom(addDeckColumnAtom)
  const setDeckNewPane = useSetAtom(deckNewPane)
  const column = useDeckColumn()

  if (deck && column) {
    return {
      isDeck: true,
      add: (e: StrictClickEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const module = createModule()

        if (e.metaKey) {
          addDeckColumn({ deckId, module })
          return
        }

        if (REPLACEABLE_COLUMNS.includes(column.type) && REPLACEABLE_COLUMNS.includes(module.type)) {
          addDeckColumn({ deckId, module, index: column.index, replace: true })
          return
        }

        const nextIndex = column.index + 1
        const next = deck.columns[nextIndex]
        // const isIncomingEvent = module.type === 'event'
        const isNextEvent = REPLACEABLE_COLUMNS.includes(next?.type)
        const replaceNext = isNextEvent
        // const replaceNext = isIncomingEvent && isNextEvent

        addDeckColumn({ deckId, module, index: nextIndex, replace: replaceNext })
        setDeckNewPane(false)
      },
    } as const
  }
  return { isDeck: false } as const
}

export function useRemoveDeckColumn(id: string | undefined) {
  const deck = useDeck()
  const removeColumn = useSetAtom(removeDeckColumnAtom)
  return () => deck && id && removeColumn({ deckId: deck.id, id })
}
