import { Duration } from 'luxon'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { createComposeStore } from '../compose/compose.store'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { BaseModuleModel } from '../modules/module'
import { Kind } from '@/constants/kinds'

export const HomeModuleModel = t.snapshotProcessor(
  BaseModuleModel.named('HomeModuleModel')
    .props({
      type: t.optional(t.literal('home'), 'home'),
      pubkey: t.string,
      feed: NotesFeedSubscriptionModel,
    })
    .volatile((self) => ({
      compose: createComposeStore({ feed: self.feed }),
    })),
  {
    preProcessor(snapshot: { pubkey: string }) {
      const { pubkey } = snapshot
      return {
        pubkey,
        feed: {
          scope: 'following' as const,
          filter: { kinds: [Kind.Text], authors: [pubkey] },
          range: Duration.fromObject({ minutes: 60 }).as('minutes'),
        },
      }
    },
  },
)

export interface HomeModule extends Instance<typeof HomeModuleModel> {}
export interface HomeModuleSnapshotIn extends SnapshotIn<typeof HomeModuleModel> {}
export interface HomeModuleSnapshotOut extends SnapshotOut<typeof HomeModuleModel> {}
