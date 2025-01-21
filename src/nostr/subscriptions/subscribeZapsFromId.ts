import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import type { NostrEventZapReceipt } from '../types'

const replay = new ShareReplayCache<NostrEventZapReceipt>()

const kinds = [Kind.ZapReceipt]

export const subscribeZapsFromId = replay.wrap(
  (_id: string, filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) => {
    return client.subscribe({ ...filter, kinds }, options).pipe(ofKind<NostrEventZapReceipt>(kinds))
  },
)
