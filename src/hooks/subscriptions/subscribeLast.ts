import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { identity, last, mergeMap } from 'rxjs'
import { subscribeRemote } from './subscribeCacheFirst'

export function subscribeLastEvent(ctx: NostrContext, filter: NostrFilter) {
  return subscribeRemote(ctx, filter).pipe(mergeMap(identity), last(undefined, null))
}
