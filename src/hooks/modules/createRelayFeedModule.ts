import { Kind } from '@/constants/kinds'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export function createRelayFeedModule(relay: string): FeedModule {
  const id = `${relay}_feed`
  const filter = {
    kinds: [Kind.Text, Kind.Repost, Kind.Media, Kind.Video, Kind.Article],
    limit: 250,
  }
  return {
    id,
    type: 'relayfeed',
    queryKey: queryKeys.feed(id, filter),
    filter,
    includeReplies: false,
    ctx: {
      network: 'REMOTE_ONLY',
      negentropy: false,
      outbox: false,
      relays: [relay],
    },
    scope: 'self',
  }
}
