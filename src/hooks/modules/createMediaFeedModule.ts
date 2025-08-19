import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type MediaFeedModule = FeedModule & {
  type: 'media'
  layout: 'row' | 'grid'
}

export function createMediaFeedModule(pubkey?: string): MediaFeedModule {
  if (pubkey) {
    const name = `media_${pubkey}`
    const filter: NostrFilter = {
      kinds: [Kind.Media],
      authors: [pubkey],
      limit: 50,
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
  const name = 'guest_media'
  const filter: NostrFilter = {
    kinds: [Kind.Media],
    limit: 50,
  }
  return {
    id: name,
    type: 'media',
    queryKey: queryKeys.feed(name, filter),
    filter,
    ctx: {
      outbox: false,
      negentropy: false,
      relays: ['wss://nostr.wine'],
    },
    layout: 'row',
    scope: 'self',
  }
}
