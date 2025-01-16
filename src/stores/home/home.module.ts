import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import type { NostrClient } from '@/nostr/nostr'
import { Duration } from 'luxon'
import { autorun } from 'mobx'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { EMPTY, shareReplay } from 'rxjs'
import { createEditorStore } from '../editor/editor.store'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { getRootStore } from '../helpers/getRootStore'
import { BaseModuleModel } from '../modules/module'

type HomeFeeds = 'notes' | 'replies'

export const HomeModuleModel = t.snapshotProcessor(
  BaseModuleModel.named('HomeModuleModel')
    .props({
      type: t.optional(t.literal('home'), 'home'),
      selected: t.enumeration<HomeFeeds>('feed', ['notes', 'replies']),
      notes: NotesFeedSubscriptionModel,
      replies: NotesFeedSubscriptionModel,
    })
    .views((self) => ({
      get feed() {
        return self.selected === 'notes' ? self.notes : self.replies
      },
    }))
    .volatile((self) => ({
      editor: createEditorStore({ onPublish: self.feed.addPublish }),
    }))
    .actions((self) => ({
      subscribe(client: NostrClient) {
        if (!self.feed.started) {
          self.feed.started = true
          return self.feed.subscribe(client).pipe(shareReplay(1))
        }
        return EMPTY
      },
      select(feed: HomeFeeds) {
        self.selected = feed
      },
      afterCreate() {
        // Keep pubkey synced with authStore
        autorun(() => {
          const root = getRootStore(self)
          const pubkey = root.auth.selected?.pubkey
          if (pubkey) {
            self.feed.pagination.setFilter({ authors: [pubkey] })
          } else {
            // we eventually wanna run a algo feed relay instead of these pubkeys
            self.feed.pagination.setFilter({ authors: [RECOMMENDED_PUBKEYS] })
          }
        })
      },
    })),
  {
    preProcessor(snapshot: { selected?: HomeFeeds }) {
      const options = {
        scope: 'following' as const,
        filter: { kinds: [Kind.Text, Kind.Repost] },
        range: Duration.fromObject({ minutes: 60 }).as('minutes'),
      }
      return {
        selected: 'notes' as const,
        ...snapshot,
        notes: {
          ...options,
          options: {
            includeParents: false,
            includeReplies: false,
          },
        },
        replies: {
          ...options,
          options: {
            includeReplies: true,
          },
        },
      }
    },
  },
)

export interface HomeModule extends Instance<typeof HomeModuleModel> {}
export interface HomeModuleSnapshotIn extends SnapshotIn<typeof HomeModuleModel> {}
export interface HomeModuleSnapshotOut extends SnapshotOut<typeof HomeModuleModel> {}
