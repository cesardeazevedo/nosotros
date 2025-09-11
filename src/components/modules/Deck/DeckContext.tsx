import type { DeckColumn } from '@/atoms/deck.atoms'
import { createContext } from 'use-context-selector'

export const DeckColumnContext = createContext<(DeckColumn & { index: number }) | undefined>(undefined)
