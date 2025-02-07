import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import type { NostrEventZapReceipt } from '../types'
import { subscribeZaps } from './subscribeZaps'

const replay = new ShareReplayCache<NostrEventZapReceipt>()

export const subscribeZapsFromId = replay.wrap(
  (_id: string, filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) => {
    return subscribeZaps(filter, client, options)
  },
)
