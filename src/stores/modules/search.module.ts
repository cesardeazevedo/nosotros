import { Kind } from '@/constants/kinds'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { switchMap } from 'rxjs'
import { NotesFeedSubscriptionModel } from '../feeds/feed.notes'
import { FeedPaginationLimit } from '../feeds/feed.pagination.limit'
import { toStream } from '../helpers/toStream'
import { rootStore } from '../root.store'
import { BaseModuleModel } from './module'
import { toJS } from 'mobx'

export const SearchModuleModel = BaseModuleModel.named('SearchModuleModel')
  .props({
    type: t.optional(t.literal('search'), 'search'),
    query: t.string,
    feed: NotesFeedSubscriptionModel(FeedPaginationLimit),
  })
  .views((self) => ({
    subscribe() {
      return toStream(() => self.query).pipe(
        switchMap((query) => {
          self.feed.setFilter({ search: query })
          return self.feed.subscribe(self.contextWithFallback.context)
        }),
      )
    },
  }))
  .actions((self) => ({
    setQuery(query: string) {
      self.query = query
    },
  }))

export function createSearchModule(snapshot: { id?: string; query: string }) {
  const { id, query } = snapshot
  return SearchModuleModel.create({
    id,
    query,
    feed: {
      scope: 'self',
      limit: 50,
      filter: {
        kinds: [Kind.Text],
        search: query,
      },
      blured: true,
    },
    context: {
      relays: ['wss://relay.nostr.band'],
      settings: {
        ...toJS(rootStore.nostrSettings),
        localDB: false,
      },
    },
  })
}

export interface SearchModule extends Instance<typeof SearchModuleModel> {}
export interface SearchModuleSnapshotIn extends SnapshotIn<typeof SearchModuleModel> {}
export interface SearchModuleSnapshotOut extends SnapshotOut<typeof SearchModuleModel> {}
