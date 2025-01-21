import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'

// A share replay cache for reactions makes a lot of sense when users are sharing the same
// popular post, so we avoid overload indexeddb getting reactions for the same post twice
const replay = new ShareReplayCache<NostrEvent>()

const kinds = [Kind.Reaction]

export const subscribeReactionsFromId = replay.wrap(
  (_id: string, filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) => {
    return client.subscribe({ ...filter, kinds }, options)
  },
)
