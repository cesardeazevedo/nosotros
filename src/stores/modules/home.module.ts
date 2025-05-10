import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { WRITE } from '@/nostr/types'
import { Duration } from 'luxon'
import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { FeedStoreModel } from '../feeds/feed.store'
import { BaseModuleModel } from './base.module'

type HomeFeeds = 'notes' | 'replies'

export const HomeModuleModel = BaseModuleModel.named('HomeModuleModel')
  .props({
    type: t.optional(t.literal('home'), 'home'),
    selected: t.optional(t.enumeration<HomeFeeds>('feed', ['notes', 'replies']), 'notes'),
    pubkey: t.maybe(t.string),
  })
  .volatile((self) => {
    const { pubkey } = self
    return {
      notes: FeedStoreModel.create({
        scope: pubkey ? 'following' : 'self',
        context: { pubkey, permission: WRITE },
        filter: { kinds: [Kind.Text, Kind.Repost], authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS },
        range: Duration.fromObject({ hours: 6 }).as('minutes'),
        options: {
          includeRoot: true,
          includeParents: false,
          includeReplies: false,
        },
      }),
      replies: FeedStoreModel.create({
        scope: pubkey ? 'following' : 'self',
        context: { pubkey, permission: WRITE },
        filter: { kinds: [Kind.Text], authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS },
        range: Duration.fromObject({ hours: 6 }).as('minutes'),
        options: {
          includeRoot: false,
          includeParents: false,
          includeReplies: true,
        },
      }),
    }
  })
  .views((self) => ({
    get feed() {
      return self[self.selected]
    },
  }))
  .actions((self) => ({
    select(feed: HomeFeeds) {
      self.selected = feed
    },
  }))

export interface HomeModule extends Instance<typeof HomeModuleModel> {}
