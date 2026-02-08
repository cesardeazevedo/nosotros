import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { DateTime } from 'luxon'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'
import { createRelayFeedModule } from './createRelayFeedModule'

export function createHomeFeedModule(pubkey?: string): FeedModule {
  if (!pubkey) {
    return createRelayFeedModule('wss://nostr.wine')
  }
  const id = pubkey ? `home_${pubkey}` : 'guest'
  const filter = {
    kinds: [Kind.Text, Kind.Repost, Kind.Media, Kind.Video, Kind.Article],
    authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS,
    since: DateTime.now().minus({ days: 7 }).toUnixInteger(),
    limit: 250,
  }
  return {
    id,
    type: 'home',
    includeReplies: false,
    queryKey: queryKeys.feed(id, filter),
    filter,
    ctx: {},
    scope: pubkey ? 'following' : 'self',
    staleTime: 300000,
  }
}
