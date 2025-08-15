import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { DateTime } from 'luxon'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export function createHomeFeedModule(pubkey?: string): FeedModule {
  const id = pubkey ? `home_${pubkey}` : 'guest'
  const filter = {
    kinds: [Kind.Text, Kind.Repost],
    authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS,
    limit: 50,
    since: DateTime.now().minus({ days: 7 }).toUnixInteger(),
  }
  return {
    id,
    type: 'home',
    queryKey: queryKeys.feed(id, filter),
    filter,
    ctx: {},
    scope: pubkey ? 'following' : 'self',
  }
}
