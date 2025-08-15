import { Kind } from '@/constants/kinds'
import { FALLBACK_RELAYS } from '@/constants/relays'
import type { RelayFilters } from '@/core/NostrSubscriptionBuilder'
import type { NostrFilter } from '@/core/types'
import type { RelayStatsDB } from '@/db/types'
import { isAuthorTag } from '@/hooks/parsers/parseTags'
import { selectRelays } from '@/hooks/parsers/selectRelays'
import type { NostrContext } from '@/nostr/context'
import { READ, WRITE } from '@/nostr/types'
import type { UnsignedEvent } from 'nostr-tools'
import { defaultIfEmpty, EMPTY, from, identity, map, merge, mergeMap, of, toArray } from 'rxjs'
import { batcherRelayList } from '../batchers'
import { queryClient } from '../query/queryClient'
import { queryKeys } from '../query/queryKeys'
import { replaceableEventQueryOptions } from '../query/useQueryBase'
import { DEFAULT_STATS } from '../query/useRelayStats'

function fetchRelayStats(relay: string) {
  return queryClient.getQueryData<RelayStatsDB>(queryKeys.relayStats(relay)) || { url: relay, ...DEFAULT_STATS }
}

async function fetchRelayList(pubkey: string) {
  return await queryClient.fetchQuery(
    replaceableEventQueryOptions(Kind.RelayList, pubkey, {
      ctx: {
        network: 'STALE_WHILE_REVALIDATE_BATCH',
        batcher: batcherRelayList,
      },
    }),
  )
}

function subscribeAuthorsRelayList(authors: string[], ctx: NostrContext) {
  return from(authors).pipe(
    mergeMap((pubkey) =>
      from(fetchRelayList(pubkey)).pipe(
        defaultIfEmpty([]),
        mergeMap(identity),
        mergeMap((event) => {
          return from(event.metadata?.relayList || []).pipe(
            mergeMap((relay) => of(fetchRelayStats(relay.relay))),
            toArray(),
            map((stats) => {
              const statsMap = stats.filter((x) => !!x).reduce((acc, x) => ({ ...acc, [x.url]: x }), {})
              const selected = selectRelays(event.metadata?.relayList || [], ctx, statsMap).map((x) => x.relay)
              return [event.pubkey, selected.length ? selected : FALLBACK_RELAYS] as const
            }),
          )
        }),
        // combineLatestWith(fetchRelayStats()),
        // map(([event, stats]) => {
        //   const selected = selectRelays(event.metadata?.relayList || [], ctx, stats)
        //   return [event.pubkey, selected.length ? selected.map((x) => x.relay) : FALLBACK_RELAYS] as const
        // }),
        defaultIfEmpty([pubkey, FALLBACK_RELAYS] as const),
      ),
    ),
  )
}

/**
 * Splits authors, #p and ids from a nostr filter into the respective relays
 * based on each author relay list and relay hints.
 */
export function subscribeOutbox(filter: NostrFilter, ctx: NostrContext) {
  function byField(field: 'authors' | '#p', values: string[]) {
    const permission = field === 'authors' ? WRITE : READ
    return subscribeAuthorsRelayList(values, { ...ctx, permission }).pipe(
      mergeMap(([pubkey, relays]) => {
        const mapped = relays.map((relay) => [relay, { ...filter, [field]: [pubkey] }] as RelayFilters)
        return from(mapped)
      }),
    )
  }

  function byId<T extends 'ids' | '#e' | '#a'>(field: T) {
    const values = filter[field]
    if (!values?.length || !ctx.relayHints?.idHints) {
      return EMPTY
    }

    // tags should be lookat READ relays
    const permission = field === 'ids' ? WRITE : READ

    return from(values).pipe(
      mergeMap((ref) => {
        const authors = ctx.relayHints!.idHints![ref] || []

        if (!authors.length) {
          return EMPTY
        }
        return subscribeAuthorsRelayList(authors, { ...ctx, permission }).pipe(
          mergeMap(([, relays]) => {
            return from(relays.map((relay) => [relay, { ...filter, [field]: [ref] }] as RelayFilters))
          }),
        )
      }),
    )
  }

  // Split filters
  if (filter.authors) {
    return byField('authors', filter.authors)
  } else if (filter['#p']) {
    return byField('#p', filter['#p'])
  } else if (filter.ids?.length) {
    return byId('ids')
  } else if (filter['#e']?.length) {
    return byId('#e')
  } else if (filter['#a']?.length) {
    return byId('#a')
  }

  return EMPTY
}

export function subscribeEventRelays(event: UnsignedEvent, ctx: NostrContext) {
  const owner = subscribeAuthorsRelayList([event.pubkey], { ...ctx, permission: WRITE })
  const mentions = from(event.tags.filter(isAuthorTag).map((tag) => tag[1])).pipe(
    mergeMap((pubkey) => subscribeAuthorsRelayList([pubkey], { ...ctx, permission: READ })),
  )

  return merge(owner, mentions).pipe(
    map((x) => x[1]),
    toArray(),
    mergeMap(identity),
  )
}
