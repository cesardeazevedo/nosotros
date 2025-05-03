import { Kind } from '@/constants/kinds'
import type { NostrContext } from '@/nostr/context'
import { WRITE } from '@/nostr/types'
import { Duration } from 'luxon'
import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { FeedStoreModel } from '../feeds/feed.store'
import { BaseModuleModel } from './base.module'

type Feeds = 'notes' | 'replies' | 'media' | 'articles' | 'bookmarks' | 'reactions'

export const NProfileModuleModel = BaseModuleModel.named('NProfileModuleModel')
  .props({
    type: t.optional(t.literal('nprofile'), 'nprofile'),
    pubkey: t.string,
    relays: t.optional(t.array(t.string), []),
    selected: t.optional(t.string, 'notes'),
  })
  .volatile((self) => {
    const { pubkey } = self
    const props = { scope: 'self' as const, context: { pubkey, permission: WRITE } as NostrContext }
    return {
      feeds: {
        notes: FeedStoreModel.create({
          ...props,
          filter: { kinds: [Kind.Text, Kind.Repost], authors: [pubkey], limit: 50 },
          options: {
            includeRoot: true,
            includeParents: false,
            includeReplies: false,
          },
        }),
        replies: FeedStoreModel.create({
          ...props,
          filter: { kinds: [Kind.Text], authors: [pubkey], limit: 30 },
          options: {
            includeRoot: false,
            includeParents: false,
            includeReplies: true,
          },
        }),
        media: FeedStoreModel.create({
          ...props,
          filter: { kinds: [Kind.Media], authors: [pubkey], limit: 50 },
        }),
        articles: FeedStoreModel.create({
          ...props,
          range: Duration.fromObject({ days: 180 }).as('minutes'),
          filter: { kinds: [Kind.Article], authors: [pubkey], limit: 30 },
        }),
        bookmarks: FeedStoreModel.create({
          ...props,
          range: Duration.fromObject({ days: 30 }).as('minutes'),
          filter: { kinds: [Kind.BookmarkList], authors: [pubkey], limit: 20 },
        }),
        reactions: FeedStoreModel.create({
          ...props,
          range: Duration.fromObject({ days: 7 }).as('minutes'),
          filter: { kinds: [Kind.Reaction], authors: [pubkey], limit: 20 },
        }),
      },
    }
  })
  .views((self) => ({
    get feed() {
      return self.feeds[self.selected as Feeds]
    },
  }))
  .actions((self) => ({
    select(selected: string) {
      self.selected = selected
    },
  }))

export interface NProfileModule extends Instance<typeof NProfileModuleModel> {}
