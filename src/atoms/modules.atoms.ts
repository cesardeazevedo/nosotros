import { STORAGE_MODULES } from '@/constants/storage'
import type { Modules } from '@/hooks/modules/module'
import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { atomWithStorage } from 'jotai/utils'
import type { createFeedAtoms } from './feed.atoms'
import type { createMediaFeedAtoms } from './feed.media.atoms'
import type { createNotificationFeedAtoms } from './feed.notification.atoms'

export type FeedAtoms =
  | ReturnType<typeof createFeedAtoms>
  | ReturnType<typeof createMediaFeedAtoms>
  | ReturnType<typeof createNotificationFeedAtoms>

export const persistentFeedStatesAtom = atomWithStorage<Record<string, Modules>>(STORAGE_MODULES, {}, undefined, {
  getOnInit: true,
})

export const sessionFeedStatesAtom = atom<Record<string, Modules>>({})

export function createModuleAtoms<T extends Modules>(options: T) {
  const id = options.id

  const sessionStateAtom = atom(
    (get) => {
      const sessionState = get(sessionFeedStatesAtom)[id]
      const persistentState = get(persistentFeedStatesAtom)[id]

      if (sessionState) {
        return sessionState as T
      }

      const merged = {
        ...options,
        ...persistentState,
      } as T

      return {
        ...merged,
        ctx: {
          ...options.ctx,
          ...persistentState?.ctx,
        },
      } as T
    },
    (get, set, updates: Partial<T> | ((prev: T) => Partial<T>)) => {
      const currentState = get(sessionStateAtom)
      const allStates = get(sessionFeedStatesAtom)
      const newState = typeof updates === 'function' ? updates(currentState) : updates
      set(sessionFeedStatesAtom, {
        ...allStates,
        [id]: { ...currentState, ...newState } as T,
      })
    },
  )

  const filter = focusAtom(sessionStateAtom, (opts) => opts.prop('filter'))

  return {
    atom: sessionStateAtom,
    filter,
    options,
  }
}
