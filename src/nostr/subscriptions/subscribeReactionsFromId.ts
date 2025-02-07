import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import { subscribeReactions } from './subscribeReactions'

// A share replay cache for reactions makes a lot of sense when users are sharing the same
// popular post, so we avoid overload indexeddb getting reactions for the same post twice
const replay = new ShareReplayCache<NostrEvent>()

export const subscribeReactionsFromId = replay.wrap(
  (_id: string, filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) => {
    return subscribeReactions(filter, client, options)
  },
)
