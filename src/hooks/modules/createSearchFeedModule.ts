import { Kind } from '@/constants/kinds'
import { SEARCH_RELAYS } from '@/constants/relays'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export function createSearchFeedModule(search: string): FeedModule {
  const id = `search_${search}`
  const filter = {
    kinds: [Kind.Text],
    search,
    limit: 100,
  }
  return {
    id,
    type: 'search',
    queryKey: queryKeys.feed(id, filter),
    filter,
    includeReplies: undefined,
    ctx: {
      network: 'STALE_WHILE_REVALIDATE',
      relays: SEARCH_RELAYS,
      outbox: false,
    },
    scope: 'self',
  }
}
