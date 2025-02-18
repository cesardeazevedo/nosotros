import { Kind } from '@/constants/kinds'
import { authenticate } from '@/nostr/auth'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { identity } from 'observable-hooks'
import { distinct, mergeMap } from 'rxjs'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { FeedPaginationLimit } from '../feeds/feed.pagination.limit'
import { toStream } from '../helpers/toStream'
import { BaseModuleModel } from '../modules/module'
import { rootStore } from '../root.store'
import { relaysStore } from './relays.store'

export const RelayFeedModuleModel = BaseModuleModel.named('RelayFeedModuleModel')
  .props({
    type: t.optional(t.literal('relayfeed'), 'relayfeed'),
    relays: t.array(t.string),
    feed: NotesFeedSubscriptionModel(FeedPaginationLimit),
  })
  .views((self) => ({
    get auths(): [string, string][] {
      return [...relaysStore.auths.entries().filter(([relay]) => self.relays.includes(relay))]
    },
  }))
  .actions((self) => ({
    afterCreate() {
      toStream(() => self.auths)
        .pipe(
          mergeMap(identity),
          distinct((value) => value[0] + value[1]),
          // Authenticate
          mergeMap(([relay, challenge]) => authenticate(rootStore.rootContext.context, relay, challenge)),
          // Restart the feed
          mergeMap(() => self.feed.subscribe(self.contextWithFallback.context)),
        )
        .subscribe()
    },
  }))

export function createRelayFeedModule(relays: string[]) {
  return RelayFeedModuleModel.create({
    relays,
    feed: {
      limit: 100,
      filter: { kinds: [Kind.Text, Kind.Repost] },
      scope: 'self',
      blured: true,
      options: {
        includeParents: true,
        includeReplies: true,
      },
    },
    context: {
      settings: {
        ...rootStore.nostrSettings,
        nip05: false,
        hints: true,
        outbox: false,
        localDB: false,
        localRelays: [],
      },
      relays,
    },
  })
}

export interface RelayFeedModule extends Instance<typeof RelayFeedModuleModel> {}
export interface RelayFeedModuleSnapshotIn extends SnapshotIn<typeof RelayFeedModuleModel> {}
export interface RelayFeedModuleSnapshotOut extends SnapshotOut<typeof RelayFeedModuleModel> {}
