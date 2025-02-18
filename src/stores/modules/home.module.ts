import { Kind } from '@/constants/kinds'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { createEditorStore } from '../editor/editor.store'
import type { FeedScope, NotesFeedSubscription } from '../feeds/feed.notes'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { FeedPaginationRange } from '../feeds/feed.pagination.range'
import { BaseModuleModel } from '../modules/module'

type HomeFeeds = 'notes' | 'replies'

export const HomeModuleModel = BaseModuleModel.named('HomeModuleModel')
  .props({
    type: t.optional(t.literal('home'), 'home'),
    selected: t.optional(t.enumeration<HomeFeeds>('feed', ['notes', 'replies']), 'notes'),
    notes: NotesFeedSubscriptionModel(FeedPaginationRange),
    replies: NotesFeedSubscriptionModel(FeedPaginationRange),
  })
  .views((self) => ({
    get feed(): NotesFeedSubscription {
      return self[self.selected]
    },
  }))
  .volatile((self) => ({
    editor: createEditorStore({ onPublish: self.feed.addPublish }),
  }))
  .actions((self) => ({
    select(feed: HomeFeeds) {
      self.selected = feed
    },
  }))

export function createHome(snapshot: { id?: string; scope?: Instance<typeof FeedScope>; authors: string[] }) {
  const { scope = 'following', authors } = snapshot
  return HomeModuleModel.create({
    ...snapshot,
    notes: {
      scope,
      filter: { kinds: [Kind.Text, Kind.Repost], authors },
      options: {
        includeParents: true,
        includeReplies: false,
      },
    },
    replies: {
      scope,
      filter: { kinds: [Kind.Text], authors },
      options: {
        includeParents: false,
        includeReplies: true,
      },
    },
  })
}

export interface HomeModule extends Instance<typeof HomeModuleModel> {}
export interface HomeModuleSnapshotIn extends SnapshotIn<typeof HomeModuleModel> {}
export interface HomeModuleSnapshotOut extends SnapshotOut<typeof HomeModuleModel> {}
