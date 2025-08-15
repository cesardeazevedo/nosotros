import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type MediaFeedModule = FeedModule & {
  type: 'media'
  layout: 'row' | 'grid'
}

export function createMediaFeedModule(pubkey?: string): MediaFeedModule {
  const name = pubkey ? `media_${pubkey}` : 'guest'
  const filter = {
    kinds: [Kind.Media],
    authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS,
    limit: 20,
  }
  return {
    id: name,
    type: 'media',
    queryKey: queryKeys.feed(name, filter),
    filter,
    ctx: {},
    layout: 'row',
    scope: pubkey ? 'following' : 'self',
  }
}
