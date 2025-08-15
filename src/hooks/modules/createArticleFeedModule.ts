import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export function createArticlesFeedModule(pubkey?: string): FeedModule {
  const id = pubkey ? `articles_${pubkey}` : 'recommended_articles'
  const filter = {
    kinds: [Kind.Article],
    authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS,
    limit: 20,
  }
  return {
    id,
    type: 'articles',
    queryKey: queryKeys.feed(id, filter),
    filter,
    ctx: {},
    scope: pubkey ? 'following' : 'self',
  }
}
