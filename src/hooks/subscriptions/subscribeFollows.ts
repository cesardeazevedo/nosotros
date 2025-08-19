import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { defaultIfEmpty, from, identity, map, mergeMap } from 'rxjs'
import { queryClient } from '../query/queryClient'
import { replaceableEventQueryOptions } from '../query/useQueryBase'
import { subscribeStrategy } from './subscribeStrategy'

export async function subscribeFollows(pubkey: string) {
  const res = await queryClient.fetchQuery(replaceableEventQueryOptions(Kind.Follows, pubkey))
  return res
}

export function subscribeFeedFollowing(ctx: NostrContext, filter: NostrFilter, dbFilter = filter) {
  return from(filter.authors || []).pipe(
    mergeMap((author) => subscribeFollows(author)),
    mergeMap(identity),
    map((event) => [event.pubkey, ...(event.tags.filter((x) => x[0] === 'p').map((x) => x[1]) || [])]),
    // Follow list couldn't be found
    defaultIfEmpty(RECOMMENDED_PUBKEYS),
    mergeMap((authors) => {
      return subscribeStrategy(ctx, { ...filter, authors }, { ...dbFilter, authors })
    }),
  )
}
