import type { NostrClient } from '@/nostr/nostr'
import { useNostrClientContext } from '@/stores/context/nostr.context.hooks'
import { pluckFirst, useObservable, useSubscription } from 'observable-hooks'
import type { Observable } from 'rxjs'
import { switchMap } from 'rxjs'

export function useFeed(feed: { subscribe: (client: NostrClient) => Observable<unknown> }) {
  const { client } = useNostrClientContext()
  const sub = useObservable(
    (feed$) => {
      return feed$.pipe(
        pluckFirst,
        switchMap((feed) => feed.subscribe(client)),
      )
    },
    [feed],
  )
  useSubscription(sub)
}
