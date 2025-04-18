import type { ModulesInstances } from '@/stores/modules/module.store'
import { createContext } from 'react'

export const deckContextvalues = {}

export const DeckContext = createContext({
  ...deckContextvalues,
  module: undefined,
  index: undefined,
} as {
  module: ModulesInstances | undefined
  index: number | undefined
})
