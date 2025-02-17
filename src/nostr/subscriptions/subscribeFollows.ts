import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrContext } from '../context'
import { ShareReplayCache } from '../replay'
import type { NostrEventFollow } from '../types'
import { subscribe } from './subscribe'

export const replay = new ShareReplayCache<NostrEventFollow>()

const kinds = [Kind.Follows]

export const subscribeFollows = replay.wrap((pubkey: string, ctx: NostrContext) => {
  const filter = { kinds, authors: [pubkey] }
  return subscribe(filter, ctx).pipe(ofKind<NostrEventFollow>(kinds))
})
