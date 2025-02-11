import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import { ShareReplayCache } from '../replay'
import type { NostrEventRepost } from '../types'
import { subscribe } from './subscribe'

const replay = new ShareReplayCache<NostrEventRepost>()

const kinds = [Kind.Repost]

export const subscribeRepostsFromId = replay.wrap((_id: string, filter: NostrFilter, ctx: NostrContext) => {
  return subscribe({ ...filter, kinds }, ctx).pipe(ofKind<NostrEventRepost>(kinds))
})
