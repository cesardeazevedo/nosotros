import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import { ShareReplayCache } from '../replay'
import { WRITE, type NostrEventMetadata } from '../types'
import { subscribe } from './subscribe'

export const replay = new ShareReplayCache<NostrEventMetadata>()

const kinds = [Kind.Follows]

export const subscribeFollows = replay.wrap((pubkey: string, ctx: NostrContext) => {
  const filter = { kinds, authors: [pubkey] }
  return subscribe(filter, { ...ctx, pubkey, permission: WRITE })
})

export const subscribeFollowSets = (filter: NostrFilter, ctx: NostrContext) => {
  const pubkey = filter.authors?.[0]
  return subscribe({ ...filter, kinds: [Kind.FollowSets] }, { ...ctx, queryDB: true, pubkey, permission: WRITE })
}

export const subscribeFollowSetById = (pubkey: string, identifier: string, ctx: NostrContext) => {
  return subscribe({ kinds: [Kind.FollowSets], authors: [pubkey], '#d': [identifier] }, ctx)
}
