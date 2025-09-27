import { STORAGE_RELAYS_AUTH } from '@/constants/storage'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Observable } from 'rxjs'
import { store } from './store'

export const authWhitelistAtom = atomWithStorage<string[]>(STORAGE_RELAYS_AUTH, [])

export const toggleAuthRelayAtom = atom(null, (get, set, relay: string) => {
  const whitelist = get(authWhitelistAtom)
  const has = whitelist.includes(relay)
  const newWhitelist = has ? whitelist.filter((x) => x !== relay) : [...whitelist, relay]
  set(authWhitelistAtom, newWhitelist)
})

export const whitelist$ = new Observable<string[]>((subscriber) => {
  const unsubscribe = store.sub(authWhitelistAtom, () => {
    subscriber.next(store.get(authWhitelistAtom))
  })
  subscriber.next(store.get(authWhitelistAtom))
  return () => unsubscribe()
})
