import { STORAGE_LAST_SEEN_KEY } from '@/constants/storage'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { selectedPubkeyAtom } from './auth.atoms'

type LastSeen = {
  home: number
  homeThreads: number
  notifications: number
}

export const DEFAULT_LAST_SEEN: LastSeen = {
  home: 0,
  homeThreads: 0,
  notifications: 0,
}

export const lastSeenStoreAtom = atomWithStorage<Record<string, LastSeen>>(STORAGE_LAST_SEEN_KEY, {})

export const selectedLastSeenAtom = atom((get) => {
  const pubkey = get(selectedPubkeyAtom)
  if (!pubkey) {
    return undefined
  }

  const map = get(lastSeenStoreAtom)
  return map[pubkey] ?? DEFAULT_LAST_SEEN
})

export const updateLastSeenAtom = atom(null, (get, set, key: keyof LastSeen, date: number) => {
  const pubkey = get(selectedPubkeyAtom)
  if (!pubkey) {
    return
  }

  set(lastSeenStoreAtom, (prev) => {
    const current = prev[pubkey] ?? DEFAULT_LAST_SEEN
    return {
      ...prev,
      [pubkey]: {
        ...current,
        [key]: Math.max(current[key] || 0, date + 1),
      },
    }
  })
})
