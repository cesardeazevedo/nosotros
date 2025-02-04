import type { ModulesInstances } from '@/stores/modules/module.store'
import { createContext } from 'react'
import { firstValueFrom, timer } from 'rxjs'

export const DeckContext = createContext({
  module: undefined,
  index: undefined,
  delay: firstValueFrom(timer(1000)),
} as {
  module: ModulesInstances | undefined
  index: number | undefined
  delay: Promise<0>
})
