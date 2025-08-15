import { Kind } from '@/constants/kinds'
import { DateTime } from 'luxon'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export function createRelayFeedModule(relay: string): FeedModule {
  const id = `${relay}_feed`
  const filter = {
    kinds: [Kind.Text, Kind.Repost],
    limit: 50,
    since: DateTime.now().minus({ days: 7 }).toUnixInteger(),
  }
  return {
    id,
    type: 'relayfeed',
    queryKey: queryKeys.feed(id, filter),
    filter,
    ctx: {
      network: 'REMOTE_ONLY',
      negentropy: false,
      outbox: false,
      relays: [relay],
    },
    scope: 'self',
  }
}
