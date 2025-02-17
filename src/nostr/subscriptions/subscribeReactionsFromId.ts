import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import type { NostrContext } from '../context'
import { ShareReplayCache } from '../replay'
import { subscribeReactions } from './subscribeReactions'

// A share replay cache for reactions makes a lot of sense when users are sharing the same
// popular post, so we avoid overload indexeddb getting reactions for the same post twice
const replay = new ShareReplayCache<NostrEvent>()

export const subscribeReactionsFromId = replay.wrap((_id: string, filter: NostrFilter, ctx: NostrContext) => {
  return subscribeReactions(filter, ctx)
})
