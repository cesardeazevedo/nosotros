import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type ArticlesFeedModule = FeedModule & {
  type: 'articles'
}

export function createArticlesFeedModule(pubkey?: string): ArticlesFeedModule {
  if (pubkey) {
    const name = `articles_${pubkey}`
    const filter: NostrFilter = {
      kinds: [Kind.Article],
      authors: [pubkey],
      limit: 50,
    }
    return {
      id: name,
      type: 'articles',
      queryKey: queryKeys.feed(name, filter),
      filter,
      ctx: {},
      scope: 'following',
    }
  }
  const name = 'recommended_articles'
  const filter: NostrFilter = {
    kinds: [Kind.Article],
    limit: 50,
  }
  return {
    id: name,
    type: 'articles',
    queryKey: queryKeys.feed(name, filter),
    filter,
    ctx: {
      outbox: false,
      negentropy: false,
      relays: ['wss://nostr.wine'],
    },
    scope: 'self',
  }
}
