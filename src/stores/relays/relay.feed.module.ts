import type { NostrClient } from '@/nostr/nostr'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { FeedPaginationLimit } from '../feeds/feed.pagination.limit'
import { BaseModuleModel } from '../modules/module'

export const RelayFeedModuleModel = BaseModuleModel.named('RelayFeedModuleModel')
  .props({
    type: t.optional(t.literal('nevent'), 'nevent'),
    relays: t.array(t.string),
    feed: NotesFeedSubscriptionModel(FeedPaginationLimit),
  })
  .views((self) => ({
    subscribe(client: NostrClient) {
      return self.feed.subscribe(client)
    },
  }))

export interface RelayFeedModule extends Instance<typeof RelayFeedModuleModel> {}
export interface RelayFeedModuleSnapshotIn extends SnapshotIn<typeof RelayFeedModuleModel> {}
export interface RelayFeedModuleSnapshotOut extends SnapshotOut<typeof RelayFeedModuleModel> {}
