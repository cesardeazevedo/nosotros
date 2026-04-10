import type { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type ListFeedModule = FeedModule & {}

type CreateListModuleParams = {
  kinds: Kind[]
  pubkey?: string
  authors?: string[]
  limit?: number
  pageSize?: number
  id?: string
  scope?: FeedModule['scope']
}

export function createListModule({
  kinds,
  pubkey,
  authors,
  limit = 50,
  pageSize = 30,
  id,
  scope,
}: CreateListModuleParams): ListFeedModule {
  const moduleId = id ?? `list_${kinds.join('_')}_feed`
  const resolvedAuthors = authors ?? (pubkey ? [pubkey] : RECOMMENDED_PUBKEYS)
  const filter = {
    kinds,
    authors: resolvedAuthors,
    limit,
  }
  return {
    id: moduleId,
    queryKey: queryKeys.feed(moduleId, filter),
    filter,
    pageSize,
    ctx: {
      outbox: true,
      negentropy: false,
    },
    type: 'lists',
    scope: scope ?? (pubkey ? 'following' : 'self'),
    live: false,
  }
}
