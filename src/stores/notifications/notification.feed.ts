import { Kind } from '@/constants/kinds'
import type { NostrClient } from '@/nostr/nostr'
import { metadataSymbol, type NostrEventMetadata } from '@/nostr/types'
import { observable } from 'mobx'
import { bufferTime, filter, identity, map, mergeMap, mergeWith, tap } from 'rxjs'
import { FeedStoreModel } from '../feeds/feed.store'
import { Notification } from './notification'

export const NotificationFeedModel = FeedStoreModel.named('NotificationFeedModel')
  .volatile(() => ({
    notifications: observable.map<string, Notification>(),
  }))
  .views((self) => ({
    subscribe(client: NostrClient) {
      const author = self.pagination.getValue()['#p']?.[0]
      return client.notifications.subscribePagination(self.pagination).pipe(
        mergeWith(self.paginateIfEmpty(20)),

        // filter out same author notifications
        filter((notification) => notification.pubkey !== author),

        bufferTime(700),

        filter((x) => x.length > 0),

        map((x) => x.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))),

        mergeMap(identity),

        tap((notification) => self.add(notification)),

        map((event: NostrEventMetadata) => {
          const metadata = event[metadataSymbol]
          switch (metadata.kind) {
            case Kind.Article:
            case Kind.Text: {
              return new Notification(metadata.isRoot ? 'mention' : 'reply', event)
            }
            case Kind.Reaction: {
              return new Notification('reaction', event)
            }
            case Kind.Repost: {
              return new Notification('repost', event)
            }
            case Kind.ZapReceipt: {
              return new Notification('zap', event)
            }
          }
        }),
        tap((notification) => {
          if (notification) {
            self.notifications.set(notification.id, notification)
          }
        }),
      )
    },
  }))
