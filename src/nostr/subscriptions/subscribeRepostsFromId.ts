import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import type { NostrEventRepost } from '../types'
import { subscribe } from './subscribe'

const replay = new ShareReplayCache<NostrEventRepost>()

const kinds = [Kind.Repost]

export const subscribeRepostsFromId = replay.wrap(
  (_id: string, filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) => {
    return subscribe({ ...filter, kinds }, client, options).pipe(ofKind<NostrEventRepost>(kinds))
  },
)
