import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { EMPTY } from 'rxjs'
import type { FeedScope } from '../query/useQueryFeeds'
import { subscribeCacheFirst } from './subscribeCacheFirst'
import { subscribeFeedListSetsE, subscribeFeedListSetsP } from './subscribeFeedListSets'
import { subscribeFeedFollowing } from './subscribeFollows'

export function subscribeFeed(ctx: NostrContext, scope: FeedScope, filter: NostrFilter) {
  switch (scope) {
    case 'self': {
      return subscribeCacheFirst(ctx, filter)
    }
    case 'following': {
      return subscribeFeedFollowing(ctx, filter)
    }
    case 'sets_p': {
      return subscribeFeedListSetsP(ctx, filter)
    }
    case 'sets_e': {
      return subscribeFeedListSetsE(ctx, filter)
    }
    case 'followers':
    case 'wot':
    case 'network':
    case 'global': {
      return EMPTY // todo
    }
    default: {
      return EMPTY
    }
  }
}
