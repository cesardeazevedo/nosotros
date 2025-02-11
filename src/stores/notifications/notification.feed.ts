import { Kind } from '@/constants/kinds'
import type { NostrContext } from '@/nostr/context'
import { subscribeNotifications } from '@/nostr/subscriptions/subscribeNotifications'
import type { NostrEventNote, NostrEventRepost, NostrEventZapReceipt } from '@/nostr/types'
import { metadataSymbol, type NostrEventMetadata } from '@/nostr/types'
import { observable } from 'mobx'
import { t, type Instance } from 'mobx-state-tree'
import { bufferTime, filter, finalize, identity, map, mergeMap, switchMap, tap } from 'rxjs'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { FeedPaginationLimit } from '../feeds/feed.pagination.limit'
import { toStream } from '../helpers/toStream'
import { withToggleAction } from '../helpers/withToggleAction'
import { Notification } from './notification'

export const NotificationFeedModel = NotesFeedSubscriptionModel(FeedPaginationLimit)
  .named('NotificationFeedModel')
  .props({
    muted: t.optional(t.boolean, false),
    mentions: t.optional(t.boolean, true),
    replies: t.optional(t.boolean, true),
  })
  .volatile(() => ({
    notifications: observable.map<string, Notification>(),
  }))
  .actions((self) => ({
    ...withToggleAction(self),

    setNotification(notification: Notification) {
      self.notifications.set(notification.id, notification)
    },

    subscribe(ctx: NostrContext) {
      const author = self.pagination.getValue()['#p']?.[0]
      return toStream(() => [self.filter, self.mentions, self.replies]).pipe(
        tap(() => self.pagination.setFilter({ kinds: self.filter.kinds })),
        switchMap(() => {
          return subscribeNotifications(self.pagination, ctx).pipe(
            // filter out same author notifications
            filter((notification) => notification.pubkey !== author),

            bufferTime(1200),

            filter((x) => x.length > 0),

            map((x) => x.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))),

            mergeMap(identity),

            map((event: NostrEventMetadata) => {
              const metadata = event[metadataSymbol]
              switch (metadata.kind) {
                case Kind.Article:
                case Kind.Text: {
                  return new Notification({
                    type: metadata.isRoot ? 'mention' : 'reply',
                    event: event as NostrEventNote,
                  })
                }
                case Kind.Reaction: {
                  return new Notification({
                    type: 'reaction',
                    event,
                  })
                }
                case Kind.Repost: {
                  return new Notification({
                    type: 'repost',
                    event: event as NostrEventRepost,
                  })
                }
                case Kind.ZapReceipt: {
                  return new Notification({ type: 'zap', event: event as NostrEventZapReceipt })
                }
              }
            }),

            filter((notification): notification is Notification => {
              if (self.mentions === false && notification?.type === 'mention') return false
              if (self.replies === false && notification?.type === 'reply') return false
              return notification !== undefined
            }),

            tap((notification) => self.add(notification.event)),
            tap((notification) => this.setNotification(notification)),

            finalize(() => {
              self.reset()
              self.notifications.clear()
              self.pagination.reset()
            }),
          )
        }),
      )
    },
  }))

export type NotificationFeed = Instance<typeof NotificationFeedModel>
