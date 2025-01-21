import { Kind } from '@/constants/kinds'
import type { NostrClient } from '@/nostr/nostr'
import { Duration } from 'luxon'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { BaseModuleSnapshotIn } from '../modules/module'
import { BaseModuleModel } from '../modules/module'
import { NotificationFeedModel } from './notification.feed'

export const NotificationModuleModel = t.snapshotProcessor(
  BaseModuleModel.named('NotificationModuleModel')
    .props({
      type: t.optional(t.literal('notification'), 'notification'),
      pubkey: t.string,
      feed: NotificationFeedModel,
    })
    .actions((self) => ({
      subscribe(client: NostrClient) {
        return self.feed.subscribe(client)
      },
    })),
  {
    preProcessor(snapshot: BaseModuleSnapshotIn & { pubkey: string }) {
      const { pubkey } = snapshot
      return {
        ...snapshot,
        feed: {
          scope: 'notifications' as const,
          range: Duration.fromObject({ days: 10 }).as('minutes'),
          filter: { kinds: [Kind.Text, Kind.Repost, Kind.Reaction, Kind.ZapReceipt], '#p': [pubkey] },
        },
      }
    },
  },
)

export interface NotificationModule extends Instance<typeof NotificationModuleModel> {}
export interface NotificationModuleSnapshotIn extends SnapshotIn<typeof NotificationModuleModel> {}
export interface NotificationModuleSnapshotOut extends SnapshotOut<typeof NotificationModuleModel> {}
