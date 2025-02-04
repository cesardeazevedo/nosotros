import { Kind } from '@/constants/kinds'
import type { SubscriptionOptions } from '@/core/NostrSubscription'
import type { NostrClient } from '@/nostr/nostr'
import { Duration } from 'luxon'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { EMPTY } from 'rxjs'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { FeedPaginationRange } from '../feeds/feed.pagination.range'
import { BaseModuleModel } from '../modules/module'

export type NProfileOptions = {
  pubkey: string
  relays?: string[]
}

const NProfileFeed = NotesFeedSubscriptionModel(FeedPaginationRange)

const NProfileFeedsModel = t.model('NProfileFeeds', {
  notes: NProfileFeed,
  replies: NProfileFeed,
  media: NProfileFeed,
  articles: NProfileFeed,
  bookmarks: NProfileFeed,
  reactions: NProfileFeed,
})

export const NProfileModuleModel = BaseModuleModel.named('NProfileModuleModel')
  .props({
    type: t.optional(t.literal('nprofile'), 'nprofile'),
    options: t.frozen<NProfileOptions>(),
    selected: t.string,
    feeds: NProfileFeedsModel,
  })
  .views((self) => ({
    get feed() {
      return self.feeds[self.selected as keyof NProfileFeeds] as Instance<typeof NProfileFeed>
    },
  }))
  .actions((self) => ({
    select(selected: keyof NProfileFeeds) {
      self.selected = selected as string
    },
    subscribe(client: NostrClient) {
      if (!self.feed.started) {
        self.feed.started = true
        return self.feed.subscribe(client)
      }
      return EMPTY
    },
  }))

export function createNprofileModule(snapshot: Pick<NProfileModuleSnapshotIn, 'id' | 'options'>) {
  const { pubkey, relays } = snapshot.options
  const subOptions = { relayHints: { authors: { [pubkey]: relays || [] } } } as SubscriptionOptions
  const props = { scope: 'self' as const, subOptions }
  return NProfileModuleModel.create({
    ...snapshot,
    selected: 'notes',
    context: {
      options: {
        // Always use the pubkey relays from the actual author
        pubkey: snapshot.options.pubkey,
      },
    },
    feeds: {
      notes: {
        ...props,
        range: Duration.fromObject({ days: 7 }).as('minutes'),
        filter: { kinds: [Kind.Text, Kind.Repost], authors: [pubkey] },
        options: {
          includeParents: false,
          includeReplies: false,
        },
      },
      replies: {
        ...props,
        range: Duration.fromObject({ days: 7 }).as('minutes'),
        filter: { kinds: [Kind.Text], authors: [pubkey] },
        options: {
          includeParents: false,
          includeReplies: true,
        },
      },
      media: {
        ...props,
        range: Duration.fromObject({ days: 30 }).as('minutes'),
        filter: { kinds: [Kind.Media], authors: [pubkey] },
      },
      articles: {
        ...props,
        range: Duration.fromObject({ days: 360 }).as('minutes'),
        filter: { kinds: [Kind.Article], authors: [pubkey] },
      },
      bookmarks: {
        ...props,
        limit: 10,
        range: Duration.fromObject({ days: 30 }).as('minutes'),
        filter: { kinds: [Kind.BookmarkList], authors: [pubkey] },
      },
      reactions: {
        ...props,
        limit: 10,
        range: Duration.fromObject({ days: 7 }).as('minutes'),
        filter: { kinds: [Kind.Reaction], authors: [pubkey] },
      },
    },
  })
}

export interface NProfileFeeds extends Instance<typeof NProfileFeedsModel> {}
export interface NProfileModule extends Instance<typeof NProfileModuleModel> {}
export interface NProfileModuleSnapshotIn extends SnapshotIn<typeof NProfileModuleModel> {}
export interface NProfileModuleSnapshotOut extends SnapshotOut<typeof NProfileModuleModel> {}
