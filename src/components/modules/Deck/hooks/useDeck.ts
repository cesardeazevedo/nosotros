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

const isReplaceableType = (type?: string) => {
  return !!type && REPLACEABLE_COLUMNS.includes(type as (typeof REPLACEABLE_COLUMNS)[number])
}

const shouldReplaceCurrent = (currentType: string, incomingType: string) => {
  if (currentType === 'relayfeed' && incomingType === 'event') {
    return false
  }
  return isReplaceableType(currentType) && isReplaceableType(incomingType)
}

export function useDeckAddNextColumn(createModule: () => DeckColumn) {
  const deckId = useParams({ from: '/deck/$id', shouldThrow: false })?.id
  const inDeckRoute = !!deckId

  const deck = useDeck()
  const addDeckColumn = useSetAtom(addDeckColumnAtom)
  const setDeckNewPane = useSetAtom(deckNewPane)
  const column = useDeckColumn()

  if (!inDeckRoute) {
    return { isDeck: false } as const
  }

  return {
    isDeck: true,
    add: (e: React.MouseEvent<HTMLElement> | StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const module = createModule()

      if (e.metaKey) {
        addDeckColumn({ deckId: deck.id, module })
      } else if (column && shouldReplaceCurrent(column.type, module.type)) {
        addDeckColumn({ deckId: deck.id, module, index: column.index, replace: true })
      } else if (column) {
        const nextIndex = column.index + 1
        const next = deck.columns[nextIndex]
        const replaceNext = isReplaceableType(next?.type)
        addDeckColumn({ deckId: deck.id, module, index: nextIndex, replace: replaceNext })
      } else {
        addDeckColumn({ deckId: deck.id, module, index: deck.columns.length })
      }

      setDeckNewPane(false)
    },
  } as const
}

export function useRemoveDeckColumn(id: string | undefined) {
  const deck = useDeck()
  const removeColumn = useSetAtom(removeDeckColumnAtom)
  return () => deck && id && removeColumn({ deckId: deck.id, id })
}
