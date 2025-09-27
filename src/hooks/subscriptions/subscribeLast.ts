import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { identity, last, mergeMap } from 'rxjs'
import { subscribeRemote } from './subscribeStrategy'

export function subscribeLastEvent(ctx: NostrContext, filter: NostrFilter) {
  return subscribeRemote({ ...ctx, ignoreAuth: true }, filter).pipe(mergeMap(identity), last(undefined, null))
}
