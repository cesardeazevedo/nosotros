import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'
import type { ModuleType } from './module'

const types: Record<number, ModuleType> = {
  [Kind.FollowSets]: 'followset',
  [Kind.RelaySets]: 'relayfeed',
  [Kind.StarterPack]: 'starterpack',
}

export function createListFeedModule(event: NostrEventDB): FeedModule {
  const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
  const id = `list_${event.kind}_${dTag}_feed`
  const filter: NostrFilter = {
    kinds: [event.kind, Kind.Text, Kind.Repost],
    authors: [event.pubkey],
    '#d': [dTag || ''],
    limit: 20,
  }
  return {
    id,
    queryKey: queryKeys.feed(id, filter),
    filter,
    ctx: {
      outbox: true,
      negentropy: false,
    },
    type: types[event.kind || Kind.FollowSets] || 'followset',
    scope: 'sets_p',
  }
}
