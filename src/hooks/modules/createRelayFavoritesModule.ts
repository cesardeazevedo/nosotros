import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import type { NostrFilter } from '@/core/types'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export function createRelayFavoriteModule(pubkey?: string): FeedModule {
  const authors = pubkey ? [pubkey] : RECOMMENDED_PUBKEYS
  const id = `relay_favorites_${pubkey || 'recommended'}`
  const filter: NostrFilter = {
    kinds: [Kind.RelayFavorites],
    authors,
    limit: 100,
  }
  return {
    id,
    queryKey: queryKeys.feed(id, filter),
    filter,
    ctx: {
      outbox: true,
      negentropy: true,
    },
    type: 'relayfavorites',
    scope: 'self',
    live: false,
  }
}
