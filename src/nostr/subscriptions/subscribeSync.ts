import { Kind } from '@/constants/kinds'
import type { NostrContext } from '../context'
import { WRITE } from '../types'
import { subscribe } from './subscribe'
import { withRelatedAuthors } from './withRelatedAuthor'

// A subscription for base stuff like user metadata, follows, mute list and so that keeps in sync at all time
export function subscribeSync(pubkey: string, kinds?: Kind[], baseCtx?: NostrContext) {
  const ctx = {
    ...baseCtx,
    pubkey,
    queryDB: true,
    permission: WRITE,
    outbox: false,
  } as NostrContext
  const filter = {
    kinds: kinds || [
      Kind.Metadata,
      Kind.Mutelist,
      Kind.BlossomServerList,
      Kind.RelaySets,
      Kind.FollowSets,
      Kind.Follows,
    ],
    authors: [pubkey],
  }
  return subscribe(filter, { ...ctx, batcher: 'live' }).pipe(withRelatedAuthors({ ...ctx, maxRelaysPerUser: 2 }))
}
