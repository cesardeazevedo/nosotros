import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type MediaFeedModule = FeedModule & {
  layout: 'row' | 'grid'
}

export function createMediaFeedModule(pubkey?: string): MediaFeedModule {
  if (pubkey) {
    const name = `media_${pubkey}`
    const filter: NostrFilter = {
      kinds: [Kind.Media, Kind.Video, Kind.ShortVideo],
      authors: [pubkey],
      limit: 150,
    }
    return {
      id: name,
      type: 'media',
      queryKey: queryKeys.feed(name, filter),
      filter,
      ctx: {},
      pageSize: 21,
      layout: 'row',
      scope: pubkey ? 'following' : 'self',
    }
  }
  const name = 'guest_media'
  const filter: NostrFilter = {
    kinds: [Kind.Media, Kind.Video, Kind.ShortVideo],
    limit: 150,
  }
  return {
    id: name,
    type: 'media',
    queryKey: queryKeys.feed(name, filter),
    filter,
    pageSize: 21,
    ctx: {
      outbox: false,
      negentropy: false,
      network: 'REMOTE_ONLY',
      relays: ['wss://relay.olas.app'],
    },
    layout: 'row',
    scope: 'self',
  }
}
