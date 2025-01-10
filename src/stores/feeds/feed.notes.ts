import type { NostrClient } from '@/nostr/nostr'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { EMPTY, finalize, mergeWith, switchMap, tap } from 'rxjs'
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
    // Feed options
    options: t.optional(
      t.model({
        includeRoot: t.boolean,
        includeReplies: t.boolean,
        includeReposts: t.boolean,
        includeParents: t.boolean,
      }),
      {
        includeRoot: true,
        includeReplies: false,
        includeReposts: true,
        includeParents: true,
      },
    ),
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
      return toStream(() => self.scope).pipe(
        switchMap(() => {
          return getFeedSubscription().pipe(
            // trigger pagination if the feed.notes still empty
            mergeWith(self.paginateIfEmpty()),

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
