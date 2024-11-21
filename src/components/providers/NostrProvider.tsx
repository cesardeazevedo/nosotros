import { rootStore } from '@/stores/root.store'
import type { NostrContext } from '@/stores/ui/nostr.context'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import React, { createContext } from 'react'
import { mergeMap } from 'rxjs'

type Props = {
  nostrContext?: NostrContext
  children: React.ReactNode
}

export const NostrClientContext = createContext<NostrContext>(rootStore.rootContext)

export const NostrProvider = observer((props: Props) => {
  const { children, nostrContext } = props

  const sub = useObservable(
    (input$) => {
      return input$.pipe(
        mergeMap(([nostrContext, globalNostrContext]) => {
          return (nostrContext || globalNostrContext).subscribe()
        }),
      )
    },
    [nostrContext, rootStore.rootContext, rootStore.rootContext.client],
  )
  useSubscription(sub)

  if (!nostrContext) {
    return children
  }

  return <NostrClientContext.Provider value={nostrContext}>{children}</NostrClientContext.Provider>
})
