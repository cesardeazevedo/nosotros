import { NostrReactContext } from '@/components/providers/NostrProvider'
import type { NostrStore } from '@/stores/nostr/nostr.context.store'
import { pluckFirst, useObservable, useSubscription } from 'observable-hooks'
import { useContext } from 'react'
import type { Observable } from 'rxjs'
import { EMPTY, mergeMap } from 'rxjs'

export function useNostrClientContext() {
  return useContext(NostrReactContext)
}

export function useObservableNostrContext<T>(init: (context: NostrStore) => Observable<T>) {
  const context = useNostrClientContext()
  return useObservable((context$) => context$.pipe(pluckFirst, mergeMap(init)), [context])
}

export function useNostrContextInitializer(context: NostrStore | undefined) {
  const sub = useObservable(() => context?.initialize({ subFollows: false }) || EMPTY)
  useSubscription(sub)
}
