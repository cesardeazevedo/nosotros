import type { NostrFilter, RelayHints } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { from, identity, mergeMap } from 'rxjs'
import invariant from 'tiny-invariant'
import { queryClient } from '../query/queryClient'
import { addressableEventQueryOptions } from '../query/useQueryBase'
import { subscribeCacheFirst } from './subscribeCacheFirst'

function fetchList(filter: NostrFilter) {
  const pubkey = filter.authors?.[0]
  const kind = filter.kinds?.[0]
  const d = filter['#d']?.[0]
  invariant(kind, 'Missing d tag on subscribeFeedListP')
  invariant(d, 'Missing d tag on subscribeFeedListP')
  invariant(pubkey, 'Missing author on subscribeFeedListP')
  return queryClient.fetchQuery(addressableEventQueryOptions(kind, pubkey, d))
}

export function subscribeFeedListSetsP(ctx: NostrContext, filter: NostrFilter) {
  return from(fetchList(filter)).pipe(
    mergeMap(identity),
    mergeMap((event) => {
      const authors = event.tags.filter((x) => x[0] === 'p').map((x) => x[1]) || []
      const { '#d': _, kinds: allKinds, ...rest } = filter
      const [, ...kinds] = allKinds || []
      return subscribeCacheFirst(ctx, { ...rest, kinds, authors })
    }),
  )
}

export function subscribeFeedListSetsE(ctx: NostrContext, filter: NostrFilter) {
  return from(fetchList(filter)).pipe(
    mergeMap(identity),
    mergeMap((event) => {
      const ids = event.tags.filter((x) => x[0] === 'e').map((x) => x[1]) || []
      const relayHints: RelayHints = {
        idHints: {
          ...ids.reduce((acc, id) => ({ ...acc, [id]: [event.pubkey] }), {}),
        },
      }
      return subscribeCacheFirst({ ...ctx, relayHints }, { ids })
    }),
  )
}
