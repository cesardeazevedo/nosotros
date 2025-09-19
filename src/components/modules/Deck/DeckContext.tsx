import type { Modules } from '@/hooks/modules/module'
import { createContext } from 'use-context-selector'

export const DeckColumnContext = createContext<(Modules & { index: number }) | undefined>(undefined)
