import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { Duration } from 'luxon'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { createComposeStore } from '../compose/compose.store'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { BaseModuleModel } from '../modules/module'

export const WelcomeModuleModel = BaseModuleModel.named('WelcomeModule')
  .props({
    type: t.optional(t.literal('welcome'), 'welcome'),
    feed: t.optional(NotesFeedSubscriptionModel, {
      scope: 'self',
      range: Duration.fromObject({ hour: 6 }).as('minutes'),
      filter: { kinds: [Kind.Text], authors: RECOMMENDED_PUBKEYS },
    }),
  })
  .volatile(() => ({
    compose: createComposeStore(),
  }))

export interface WelcomeModule extends Instance<typeof WelcomeModuleModel> {}
export interface WelcomeModuleSnapshotIn extends SnapshotIn<typeof WelcomeModuleModel> {}
export interface WelcomeModuleSnapshotOut extends SnapshotOut<typeof WelcomeModuleModel> {}
