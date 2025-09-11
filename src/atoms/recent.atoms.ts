import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type RecentType = 'profile' | 'relay'
export type RecentItem = { id: string; type: RecentType }

const MAX_ITEMS = 10
const STORAGE_KEY = 'RECENTS_STORE'

export const recentsAtom = atomWithStorage<RecentItem[]>(STORAGE_KEY, [])

export const addRecentAtom = atom(null, (get, set, item: RecentItem) => {
  const current = get(recentsAtom)
  const withoutId = current.filter((prev) => prev.id !== item.id)

  set(recentsAtom, [item, ...withoutId].slice(0, MAX_ITEMS))
})

export const removeRecentAtom = atom(null, (get, set, id: string) => {
  const current = get(recentsAtom)

  const next = current.filter((item) => {
    return item.id !== id
  })

  set(recentsAtom, next)
})
