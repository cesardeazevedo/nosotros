import { Kind } from '@/constants/kinds'
import { TOPIC_RELAYS } from '@/constants/relays'
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
    live: false,
    ctx: {
      network: 'REMOTE_ONLY',
      relays: TOPIC_RELAYS,
      outbox: false,
      negentropy: false,
    },
    scope: 'self',
  }
}
