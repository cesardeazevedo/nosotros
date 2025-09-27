import type { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type ListFeedModule = FeedModule & {}

export function createListModule(kind: Kind, pubkey: string | undefined): ListFeedModule {
  const id = `list_${kind}_feed`
  const filter = {
    kinds: [kind],
    authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS,
    limit: 50,
  }
  return {
    id,
    queryKey: queryKeys.feed(id, filter),
    filter,
    pageSize: 30,
    ctx: {
      outbox: true,
      negentropy: false,
    },
    type: 'lists',
    scope: pubkey ? 'following' : 'self',
    live: false,
  }
}
