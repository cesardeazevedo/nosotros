import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import type { NostrFilter } from '@/core/types'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export function createRelayFavoriteModule(): FeedModule {
  const id = 'relay_favoritoes'
  const filter: NostrFilter = {
    kinds: [Kind.RelayFavorites],
    authors: RECOMMENDED_PUBKEYS,
    limit: 100,
  }
  return {
    id,
    queryKey: queryKeys.feed(id, filter),
    filter,
    ctx: {
      outbox: true,
      negentropy: false,
    },
    type: 'relayfavorites',
    scope: 'self',
    live: false,
  }
}
