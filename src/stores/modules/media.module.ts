import { Kind } from '@/constants/kinds'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { FeedScope } from '../feeds/feed.notes'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { FeedPaginationRange } from '../feeds/feed.pagination.range'
import { BaseModuleModel } from './module'
import { Duration } from 'luxon'
import { createEditorStore } from '../editor/editor.store'

export const MediaModuleModel = BaseModuleModel.named('MediaModuleModel')
  .props({
    type: t.optional(t.literal('media'), 'media'),
    feed: NotesFeedSubscriptionModel(FeedPaginationRange),
    layout: t.enumeration<'row' | 'grid'>(['row', 'grid']),
  })
  .volatile((self) => ({
    editor: createEditorStore({ kind: Kind.Media, onPublish: self.feed.addPublish }),
  }))
  .actions((self) => ({
    afterCreate() {
      if ('increaseRange' in self.feed.pagination) {
        self.feed.pagination.increaseRange(Duration.fromObject({ hours: 24 }).as('minutes'))
        self.feed.pagination.setFilter(self.feed.filter)
      }
    },
    setLayout(layout: 'row' | 'grid') {
      self.layout = layout
    },
  }))

export function createMediaModule(snapshot: { id?: string; scope?: Instance<typeof FeedScope>; authors: string[] }) {
  const { id, scope = 'following', authors } = snapshot
  return MediaModuleModel.create({
    id,
    layout: 'row',
    feed: {
      scope,
      filter: {
        kinds: [Kind.Media],
        authors,
      },
    },
  })
}

export interface MediaModule extends Instance<typeof MediaModuleModel> {}
export interface MediaModuleSnapshotIn extends SnapshotIn<typeof MediaModuleModel> {}
export interface MediaModuleSnapshotOut extends SnapshotOut<typeof MediaModuleModel> {}
