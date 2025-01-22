import type { FeedOptions } from '@/nostr/feeds'
import { type NostrClient } from '@/nostr/nostr'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { bufferTime, EMPTY, filter, finalize, identity, map, mergeMap, mergeWith, switchMap, tap } from 'rxjs'
import { toStream } from '../helpers/toStream'
import { FeedStoreModel } from './feed.store'

export const FeedScope = t.enumeration('FeedScope', [
  'self',
  'following',
  'followingSet',
  'followers',
  'network',
  'global',
  'wot',
])

export const NotesFeedSubscriptionModel = FeedStoreModel.named('NotesFeedSubscriptionModel')
  .props({
    scope: FeedScope,
    options: t.optional(t.frozen<FeedOptions>(), {}),
  })
  .views((self) => ({
    subscribe(client: NostrClient) {
      function getFeedSubscription() {
        const { scope, pagination, options } = self
        switch (scope) {
          case 'self': {
            return client.feeds.self(pagination, options)
          }
          case 'following': {
            return client.feeds.following(pagination, options)
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
        tap(() => self.pagination.setFilter({ kinds: self.filter.kinds })),
        switchMap(() => {
          return getFeedSubscription().pipe(
            // trigger pagination if the feed.notes still empty
            mergeWith(self.paginateIfEmpty()),

            bufferTime(1200),

            filter((x) => x.length > 0),

            map((x) => x.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))),

            mergeMap(identity),

            tap((item) => self.add(item)),
            // Scope changed, reset the feed
            finalize(() => self.reset()),
          )
        }),
      )
    },
  }))

export interface NotesFeed extends Instance<typeof NotesFeedSubscriptionModel> {}
export interface NotesFeedSubscription extends Instance<typeof NotesFeedSubscriptionModel> {}
export interface NotesFeedSubscriptionSnapshotIn extends SnapshotIn<typeof NotesFeedSubscriptionModel> {}
