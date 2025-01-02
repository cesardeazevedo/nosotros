import type { NostrClient } from '@/nostr/nostr'
import { bufferTime, filter, identity, map, mergeMap, mergeWith, tap } from 'rxjs'
import { createFeedStore } from '../feeds/feed.store'
import type { Notification } from './notification'

export const NotificationFeed = createFeedStore<Notification>().named('NotificationFeed')

export const NotificationFeedSubscription = NotificationFeed.named('NotificationFeedSubscription').views((self) => ({
  subscribe(client: NostrClient) {
    const author = self.pagination.getValue()['#p']?.[0]
    return client.notifications.subscribePagination(self.pagination).pipe(
      mergeWith(self.paginateIfEmpty(20)),

      // filter out same author notifications
      filter((notification) => notification.pubkey !== author),

      bufferTime(700),

      filter((x) => x.length > 0),

      map((x) => x.sort((a, b) => (a.event.created_at > b.event.created_at ? -1 : 1))),

      mergeMap(identity),

      tap((notification) => self.add(notification)),
    )
  },
}))
