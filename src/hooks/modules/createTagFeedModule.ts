import { Kind } from '@/constants/kinds'
import { FALLBACK_RELAYS } from '@/constants/relays'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export function createTagFeedModule(tag: string): FeedModule {
  const id = `tag_${tag}`
  const filter = {
    kinds: [Kind.Text],
    '#t': [tag],
    limit: 100,
  }
  return {
    id,
    type: 'tags',
    queryKey: queryKeys.feed(id, filter),
    filter,
    ctx: {
      network: 'REMOTE_ONLY',
      relays: FALLBACK_RELAYS,
    },
    scope: 'self',
  }
}
