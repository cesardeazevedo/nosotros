import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import type { NostrEventFollow } from '../types'
import { subscribe } from './subscribe'

export const replay = new ShareReplayCache<NostrEventFollow>()

const kinds = [Kind.Follows]

export const subscribeFollows = replay.wrap((pubkey: string, client: NostrClient, options?: ClientSubOptions) => {
  const filter = { kinds, authors: [pubkey] }
  return subscribe(filter, client, options).pipe(ofKind<NostrEventFollow>(kinds))
})
