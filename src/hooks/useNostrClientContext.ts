import { NostrClientContext } from '@/components/providers/NostrProvider'
import type { NostrContext } from '@/stores/ui/nostr.context'
import { pluckFirst, useObservable } from 'observable-hooks'
import { useContext } from 'react'
import type { Observable } from 'rxjs'
import { mergeMap } from 'rxjs'

export function useNostrClientContext() {
  return useContext(NostrClientContext)
}

export function useObservableNostrContext<T>(init: (context: NostrContext) => Observable<T>) {
  const context = useNostrClientContext()
  return useObservable((context$) => context$.pipe(pluckFirst, mergeMap(init)), [context])
}
