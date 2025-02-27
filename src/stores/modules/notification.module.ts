import { Kind } from '@/constants/kinds'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { BaseModuleModel } from './module'
import { NotificationFeedModel } from '../notifications/notification.feed'

export const NotificationModuleModel = BaseModuleModel.named('NotificationModuleModel').props({
  type: t.optional(t.literal('notification'), 'notification'),
  pubkey: t.string,
  feed: NotificationFeedModel,
})

export function createNotificationModule(snapshot: Pick<NotificationModuleSnapshotIn, 'id' | 'pubkey'>) {
  return NotificationModuleModel.create({
    ...snapshot,
    context: {
      pubkey: snapshot.pubkey,
    },
    feed: {
      scope: 'self' as const,
      limit: 50,
      lastSeen: 0,
      filter: {
        kinds: [Kind.Text, Kind.Comment, Kind.Repost, Kind.Reaction, Kind.ZapReceipt],
        '#p': [snapshot.pubkey],
      },
    },
  })
}

export interface NotificationModule extends Instance<typeof NotificationModuleModel> {}
export interface NotificationModuleSnapshotIn extends SnapshotIn<typeof NotificationModuleModel> {}
export interface NotificationModuleSnapshotOut extends SnapshotOut<typeof NotificationModuleModel> {}
