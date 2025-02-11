import { type NostrContext } from '@/nostr/context'
import type { FeedOptions } from '@/nostr/subscriptions/subscribeFeed'
import { subscribeFeedFollowing } from '@/nostr/subscriptions/subscribeFeedFollowing'
import { subscribeFeedSelf } from '@/nostr/subscriptions/subscribeFeedSelf'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { bufferTime, EMPTY, filter, finalize, map, mergeWith, switchMap, tap } from 'rxjs'
import { toStream } from '../helpers/toStream'
import type { FeedPaginationLimit } from './feed.pagination.limit'
import type { FeedPaginationRange } from './feed.pagination.range'

export const FeedScope = t.enumeration('FeedScope', [
  'self',
  'following',
  'followingSet',
  'followers',
  'network',
  'global',
  'wot',
])

type FeedPaginations = typeof FeedPaginationRange | typeof FeedPaginationLimit

export const NotesFeedSubscriptionModel = (feed: FeedPaginations) =>
  feed
    .named('NotesFeedSubscriptionModel')
    .props({
      scope: FeedScope,
      options: t.optional(t.frozen<FeedOptions>(), {}),
    })
    .views((self) => ({
      subscribe(client: NostrContext) {
        function getFeedSubscription() {
          const { scope, pagination, options } = self
          switch (scope) {
            case 'self': {
              return subscribeFeedSelf(pagination, client, options)
            }
            case 'following': {
              return subscribeFeedFollowing(pagination, client, options)
            }
            case 'followingSet':
            case 'followers':
            case 'wot':
            case 'network':
            case 'global': {
              // TODO
              return EMPTY
            }
          }
        }
        return toStream(() => [self.scope, self.filter]).pipe(
          switchMap(() => {
            // Keep pagination filter in sync
            self.pagination.setFilter({ ...self.filter })
            return getFeedSubscription().pipe(
              // trigger pagination if the feed.notes still empty
              mergeWith('paginateIfEmpty' in self ? self.paginateIfEmpty() : EMPTY),

              bufferTime(400),

              filter((x) => x.length > 0),

              map((x) => x.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))),

              tap((items) => {
                items.forEach((item) => self.add(item))
              }),

              // Scope changed, reset the feed
              finalize(() => {
                self.reset()
                self.pagination.reset()
              }),
            )
          }),
        )
      },
    }))

export type NotesFeed = Instance<ReturnType<typeof NotesFeedSubscriptionModel>>
export type NotesFeedSubscription = Instance<ReturnType<typeof NotesFeedSubscriptionModel>>
export type NotesFeedSubscriptionSnapshotIn = SnapshotIn<typeof NotesFeedSubscriptionModel>
