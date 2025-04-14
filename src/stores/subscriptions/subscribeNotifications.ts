import { identity } from 'observable-hooks'
import { filter, mergeMap, tap } from 'rxjs'
import type { FeedStore } from '../feeds/feed.store'
import { rootStore } from '../root.store'
import { subscribeFeedStore } from './subscribeFeedStore'

export function subscribeNotifications(feed: FeedStore, preload = false) {
  return subscribeFeedStore(feed).pipe(
    filter(() => !preload),
    filter(() => feed.filter['#p']?.[0] === rootStore.auth.selected?.pubkey),
    mergeMap(identity),
    tap((event) => {
      rootStore.auth.selected?.setLastSeenNotification(event.created_at)
    }),
  )
}
