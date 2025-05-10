import type { SnapshotIn } from 'mobx-state-tree'
import { t, type Instance } from 'mobx-state-tree'
import { FeedStoreModel } from '../feeds/feed.store'
import { BaseModuleModel } from './base.module'

export const FeedTypeModel = t.union(
  t.literal('home'),
  t.literal('feed'),
  t.literal('media'),
  t.literal('quotes'),
  t.literal('reposts'),
  t.literal('search'),
  t.literal('tags'),
  t.literal('articles'),
  t.literal('relaysets'),
  t.literal('relayfeed'),
  t.literal('followset'),
  t.literal('starterpack'),
  t.literal('notifications'),
)

export const FeedModuleModel = BaseModuleModel.named('FeedModuleModel').props({
  feed: FeedStoreModel,
  type: t.optional(t.union(FeedTypeModel), 'feed'),
})

export interface FeedModule extends Instance<typeof FeedModuleModel> {}
export interface FeedModuleSnapshotIn extends SnapshotIn<typeof FeedModuleModel> {}
