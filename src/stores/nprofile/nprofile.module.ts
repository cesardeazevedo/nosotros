import { Kind } from '@/constants/kinds'
import type { SubscriptionOptions } from '@/core/NostrSubscription'
import type { DurationLikeObject } from 'luxon'
import { Duration } from 'luxon'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import type { BaseModuleSnapshotIn } from '../modules/module'
import { BaseModuleModel } from '../modules/module'

export type NProfileOptions = {
  pubkey: string
  relays?: string[]
}

const getRange = (obj: DurationLikeObject) => Duration.fromObject(obj).as('minutes')

const NProfileFeedsModel = t.model('NProfileFeeds', {
  notes: NotesFeedSubscriptionModel,
  replies: NotesFeedSubscriptionModel,
  photos: NotesFeedSubscriptionModel,
  articles: NotesFeedSubscriptionModel,
  bookmarks: NotesFeedSubscriptionModel,
  reactions: NotesFeedSubscriptionModel,
})

export const NProfileModuleModel = t.snapshotProcessor(
  BaseModuleModel.named('NProfileModuleModel')
    .props({
      type: t.optional(t.literal('nprofile'), 'nprofile'),
      options: t.frozen<NProfileOptions>(),
      selected: t.string,
      feeds: NProfileFeedsModel,
    })
    .actions((self) => ({
      select(selected: string) {
        self.selected = selected
      },
    })),
  {
    preProcessor(snapshot: BaseModuleSnapshotIn & { options: NProfileOptions }) {
      const { pubkey, relays } = snapshot.options
      const subOptions = { relayHints: { authors: { [pubkey]: relays || [] } } } as SubscriptionOptions
      const props = { scope: 'self' as const, subOptions }
      return {
        ...snapshot,
        selected: 'notes',
        feeds: {
          notes: {
            ...props,
            range: getRange({ days: 1 }),
            filter: { kinds: [Kind.Text], authors: [pubkey] },
          },
          replies: {
            ...props,
            range: getRange({ days: 1 }),
            filter: { kinds: [Kind.Text], authors: [pubkey] },
            options: {
              includeRoot: false,
              includeReplies: true,
              includeReposts: false,
              includeParents: false,
            },
          },
          photos: {
            ...props,
            range: getRange({ days: 30 }),
            filter: { kinds: [Kind.Photos], authors: [pubkey] },
          },
          articles: {
            ...props,
            range: getRange({ days: 30 }),
            filter: { kinds: [Kind.Article], authors: [pubkey] },
          },
          bookmarks: {
            ...props,
            range: getRange({ days: 10 }),
            limit: 10,
            filter: { kinds: [Kind.BookmarkList], authors: [pubkey] },
          },
          reactions: {
            ...props,
            range: getRange({ days: 1 }),
            limit: 10,
            filter: { kinds: [Kind.Reaction], authors: [pubkey] },
          },
        },
      }
    },
  },
)

export interface NProfileModule extends Instance<typeof NProfileModuleModel> {}
export interface NProfileModuleSnapshotIn extends SnapshotIn<typeof NProfileModuleModel> {}
export interface NProfileModuleSnapshotOut extends SnapshotOut<typeof NProfileModuleModel> {}
