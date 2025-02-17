import type { NostrStore } from '@/stores/nostr/nostr.context.store'
import { rootStore } from '@/stores/root.store'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import React, { createContext } from 'react'
import { mergeMap } from 'rxjs'

type Props = {
  subFollows?: boolean
  nostrContext: () => NostrStore
  children: React.ReactNode
}

// eslint-disable-next-line react-refresh/only-export-components
export const NostrReactContext = createContext<NostrStore>(rootStore.rootContext)

export const NostrProvider = observer(function NostrProvider(props: Props) {
  const { children, subFollows = false } = props
  const nostrContext = props.nostrContext()

  const sub = useObservable(
    (input$) => {
      return input$.pipe(mergeMap(([nostrContext]) => nostrContext.initialize({ subFollows })))
    },
    [nostrContext, nostrContext.context],
  )
  useSubscription(sub)

  return <NostrReactContext.Provider value={nostrContext}>{children}</NostrReactContext.Provider>
})
