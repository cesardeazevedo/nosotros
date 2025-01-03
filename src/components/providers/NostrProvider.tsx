import type { NostrContext } from '@/stores/context/nostr.context.store'
import { rootStore } from '@/stores/root.store'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import React, { createContext } from 'react'
import { mergeMap } from 'rxjs'

type Props = {
  subFollows?: boolean
  nostrContext: () => NostrContext
  children: React.ReactNode
}

export const NostrClientContext = createContext<NostrContext>(rootStore.rootContext)

export const NostrProvider = observer(function NostrProvider(props: Props) {
  const { children, subFollows = false } = props
  const nostrContext = props.nostrContext()

  const sub = useObservable(
    (input$) => {
      return input$.pipe(mergeMap(([nostrContext]) => nostrContext.initialize({ subFollows })))
    },
    [nostrContext],
  )
  useSubscription(sub)

  return <NostrClientContext.Provider value={nostrContext}>{children}</NostrClientContext.Provider>
})
