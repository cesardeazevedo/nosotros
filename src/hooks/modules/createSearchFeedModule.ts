import { Kind } from '@/constants/kinds'
import { SEARCH_RELAYS } from '@/constants/relays'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export function createSearchFeedModule(search: string): FeedModule {
  const id = `search_${search}`
  const filter = {
    kinds: [Kind.Text],
    search,
    limit: 500,
  }
  return {
    id,
    type: 'search',
    queryKey: queryKeys.feed(id, filter),
    filter,
    includeReplies: undefined,
    ctx: {
      network: 'REMOTE_ONLY',
      relays: SEARCH_RELAYS,
      outbox: false,
    },
    scope: 'self',
  }
}
