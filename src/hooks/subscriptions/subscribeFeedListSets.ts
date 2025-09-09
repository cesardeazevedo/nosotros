import type { NostrFilter, RelayHints } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { isAddressableKind } from 'nostr-tools/kinds'
import { from, identity, map, mergeMap } from 'rxjs'
import invariant from 'tiny-invariant'
import { queryClient } from '../query/queryClient'
import { addressableEventQueryOptions, replaceableEventQueryOptions } from '../query/useQueryBase'
import { subscribeStrategy } from './subscribeStrategy'

function fetchList(filter: NostrFilter) {
  const pubkey = filter.authors?.[0]
  const kind = filter.kinds?.[0]
  invariant(kind, 'Missing d tag on subscribeFeedListP')
  invariant(pubkey, 'Missing author on subscribeFeedListP')
  if (isAddressableKind(kind)) {
    const d = filter['#d']?.[0]
    invariant(d, 'Missing d tag on subscribeFeedListP')
    return queryClient.fetchQuery(addressableEventQueryOptions(kind, pubkey, d))
  }

  return queryClient.fetchQuery(replaceableEventQueryOptions(kind, pubkey))
}

export function subscribeFeedListSetsP(ctx: NostrContext, filter: NostrFilter) {
  return from(fetchList(filter)).pipe(
    mergeMap(identity),
    mergeMap((event) => {
      const authors = event.tags.filter((x) => x[0] === 'p').map((x) => x[1]) || []
      const { '#d': _, kinds: allKinds, ...rest } = filter
      const [, ...kinds] = allKinds || []
      return subscribeStrategy(ctx, { ...rest, kinds, authors })
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
      return subscribeStrategy({ ...ctx, relayHints }, { ids }).pipe(
        map((events) => events.sort((a, b) => b.created_at - a.created_at)),
      )
    }),
  )
}

export function subscribeFeedListRelaySets(ctx: NostrContext, filter: NostrFilter) {
  return from(fetchList(filter)).pipe(
    mergeMap(identity),
    mergeMap((event) => {
      const relays = event.tags.filter((tag) => tag[0] === 'relay').map((tag) => tag[1])
      const { '#d': _, kinds: allKinds, authors, ...rest } = filter
      const [, ...kinds] = allKinds || []
      return subscribeStrategy({ ...ctx, network: 'REMOTE_ONLY', relays }, { ...rest, kinds })
    }),
  )
}
