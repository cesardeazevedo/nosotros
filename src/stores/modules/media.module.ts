import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { WRITE } from '@/nostr/types'
import { Duration } from 'luxon'
import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { FeedStoreModel } from '../feeds/feed.store'
import { BaseModuleModel } from './base.module'

export const MediaModuleModel = BaseModuleModel.named('MediaModuleModel')
  .props({
    type: t.optional(t.literal('media'), 'media'),
    layout: t.enumeration<'row' | 'grid'>(['row', 'grid']),
    pubkey: t.maybe(t.string),
  })
  .volatile((self) => {
    const { pubkey } = self
    return {
      feed: FeedStoreModel.create({
        scope: pubkey ? 'following' : 'self',
        context: { pubkey, permission: WRITE },
        filter: {
          kinds: [Kind.Media],
          authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS,
        },
        range: Duration.fromObject({ days: 3 }).as('minutes'),
      }),
    }
  })
  .actions((self) => ({
    setLayout(layout: 'row' | 'grid') {
      self.layout = layout
    },
  }))

export interface MediaModule extends Instance<typeof MediaModuleModel> {}
