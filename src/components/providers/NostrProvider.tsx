import { useRootStore } from '@/hooks/useRootStore'
import type { NostrStore } from '@/stores/nostr/nostr.context.store'
import { rootStore } from '@/stores/root.store'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import React, { createContext } from 'react'
import { EMPTY, merge, mergeMap } from 'rxjs'

type Props = {
  initializeRelays?: boolean
  subFollows?: boolean
  subNotifications?: boolean
  nostrContext: () => NostrStore
  children: React.ReactNode
}

// eslint-disable-next-line react-refresh/only-export-components
export const NostrReactContext = createContext<NostrStore>(rootStore.rootContext)

export const NostrProvider = observer(function NostrProvider(props: Props) {
  const { children, initializeRelays = true, subFollows = false, subNotifications = false } = props
  const root = useRootStore()
  const nostrContext = props.nostrContext()

  const sub = useObservable(
    (input$) => {
      return input$.pipe(
        mergeMap(([nostrContext]) => {
          const notification = root.rootNotifications
          return merge(
            initializeRelays ? nostrContext.initialize({ subFollows }) : EMPTY,
            subNotifications && notification
              ? notification.feed.subscribe(notification.contextWithFallback.context, false)
              : EMPTY,
          )
        }),
      )
    },
    [nostrContext, nostrContext.context],
  )
  useSubscription(sub)

  return <NostrReactContext.Provider value={nostrContext}>{children}</NostrReactContext.Provider>
})
