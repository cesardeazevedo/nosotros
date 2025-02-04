import { NostrClientContext } from '@/components/providers/NostrProvider'
import type { NostrContext } from '@/stores/context/nostr.context.store'
import { pluckFirst, useObservable, useSubscription } from 'observable-hooks'
import { useContext } from 'react'
import type { Observable } from 'rxjs'
import { EMPTY, mergeMap } from 'rxjs'

export function useNostrClientContext() {
  return useContext(NostrClientContext)
}

export function useObservableNostrContext<T>(init: (context: NostrContext) => Observable<T>) {
  const context = useNostrClientContext()
  return useObservable((context$) => context$.pipe(pluckFirst, mergeMap(init)), [context])
}

export function useNostrContextInitializer(context: NostrContext | undefined) {
  const sub = useObservable(() => context?.initialize({ subFollows: false }) || EMPTY)
  useSubscription(sub)
}
