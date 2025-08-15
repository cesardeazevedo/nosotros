import { atom } from 'jotai'
import { Observable } from 'rxjs'
import { store } from './store'

export const authWhitelistAtom = atom<string[]>([])

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
