import type { ModulesInstances } from '@/stores/modules/module.store'
import { createContext } from 'react'
import { firstValueFrom, timer } from 'rxjs'

export const deckContextvalues = {
  delay: firstValueFrom(timer(50)),
}

export const DeckContext = createContext({
  ...deckContextvalues,
  module: undefined,
  index: undefined,
} as {
  module: ModulesInstances | undefined
  index: number | undefined
  delay: Promise<0>
})
