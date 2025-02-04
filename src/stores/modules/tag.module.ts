import { Kind } from '@/constants/kinds'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { FeedPaginationLimit } from '../feeds/feed.pagination.limit'
import { BaseModuleModel } from './module'

export const TagModuleModel = BaseModuleModel.named('TagModuleModel')
  .props({
    type: t.optional(t.literal('tag'), 'tag'),
    tags: t.array(t.string),
    feed: NotesFeedSubscriptionModel(FeedPaginationLimit),
  })
  .actions((self) => ({
    add(tag: string) {
      self.tags.push(tag)
    },
  }))

export function createTagModule(tags: string[]) {
  return TagModuleModel.create({
    tags,
    feed: {
      scope: 'self',
      limit: 50,
      filter: {
        kinds: [Kind.Text],
        '#t': tags,
      },
    },
  })
}

export interface TagModule extends Instance<typeof TagModuleModel> {}
export interface TagModuleSnapshotIn extends SnapshotIn<typeof TagModuleModel> {}
export interface TagModuleSnapshotOut extends SnapshotOut<typeof TagModuleModel> {}
