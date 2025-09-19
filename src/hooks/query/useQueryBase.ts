import { settingsAtom } from '@/atoms/settings.atoms'
import { store } from '@/atoms/store'
import type { Kind } from '@/constants/kinds'
import { FALLBACK_RELAYS } from '@/constants/relays'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import type { RelayHints } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { parseEventMetadata } from '@/hooks/parsers/parseEventMetadata'
import type { NostrContext } from '@/nostr/context'
import { decodeNIP19, decodeRelays, decodeToFilter, nip19ToRelayHints } from '@/utils/nip19'
import type { UseQueryOptions } from '@tanstack/react-query'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import type { Filter } from 'nostr-tools'
import { defaultIfEmpty, firstValueFrom, shareReplay, takeUntil, tap, timer } from 'rxjs'
import { batcher } from '../batchers'
import { subscribeStrategy } from '../subscriptions/subscribeStrategy'
import { queryClient } from './queryClient'
import { pointerToQueryKey, queryKeys } from './queryKeys'
import { setEventData } from './queryUtils'

export type UseQueryOptionsWithFilter<Selector = NostrEventDB[]> = UseQueryOptions<NostrEventDB[], Error, Selector> & {
  filter: Filter
  ctx?: NostrContext
}

export type CustomQueryOptions<Selector = NostrEventDB[]> = Omit<
  UseQueryOptionsWithFilter<Selector>,
  'queryKey' | 'filter'
>

export function createEventQueryOptions<Selector = NostrEventDB[]>(options: UseQueryOptionsWithFilter<Selector>) {
  const { filter, ctx = {}, ...opts } = options
  return queryOptions<NostrEventDB[], Error, Selector>({
    queryFn: async () => {
      const { maxRelaysPerUser } = store.get(settingsAtom)
      const res = await firstValueFrom(
        subscribeStrategy({ ...ctx, maxRelaysPerUser }, filter).pipe(
          tap((res) => res.forEach(setEventData)),
          tap((res) => {
            if (res) {
              queryClient.setQueryData(opts.queryKey, (old: NostrEventDB[] = []) => {
                const ids = new Set(old.map((x) => x.id))
                return [...old, ...res.filter((x) => !ids.has(x.id))]
              })
            }
          }),
          takeUntil(timer(6500)),
          shareReplay(),
          defaultIfEmpty([] as NostrEventDB[]),
        ),
      )
      return queryClient.getQueryData<NostrEventDB[]>(opts.queryKey) || res
    },
    ...opts,
  })
}

export function eventQueryOptions<Selector>(options: UseQueryOptionsWithFilter<Selector>) {
  return createEventQueryOptions({
    ...options,
    ctx: {
      network: 'CACHE_FIRST_BATCH',
      batcher,
      ...options.ctx,
    },
  })
}

/**
 * For replaceable events we use STALE_WHILE_REVALIDATE_BATCH instead of CACHE_FIRST
 * as we don't know if there's a new replceable event in the relay
 */
export function replaceableEventQueryOptions<Selector = NostrEventDB>(
  kind: Kind,
  pubkey: string,
  options?: CustomQueryOptions<Selector>,
) {
  return createEventQueryOptions<Selector>({
    filter: {
      kinds: [kind],
      authors: [pubkey],
    },
    queryKey: queryKeys.replaceable(kind, pubkey),
    ctx: {
      network: 'STALE_WHILE_REVALIDATE_BATCH',
      batcher,
      ...options?.ctx,
    },
    select: (events) => events[0] as Selector,
    ...options,
  })
}

export function addressableEventQueryOptions<Selector = NostrEventDB>(
  kind: Kind,
  pubkey: string,
  d: string,
  options?: CustomQueryOptions<Selector>,
) {
  return createEventQueryOptions<Selector>({
    filter: {
      kinds: [kind],
      authors: [pubkey],
      '#d': [d],
    },
    queryKey: queryKeys.addressable(kind, pubkey, d),
    ctx: {
      network: 'STALE_WHILE_REVALIDATE_BATCH',
      batcher,
      ...options?.ctx,
    },
    select: (events) => events[0] as Selector,
    ...options,
  })
}

export function eventFromNIP19QueryOptions(nip19: string, relayHints?: RelayHints) {
  const decoded = decodeNIP19(nip19.replace('nostr:', ''))
  const filter = decodeToFilter(decoded)!
  const relays = decodeRelays(decoded)

  return eventQueryOptions({
    queryKey: pointerToQueryKey(decoded),
    filter,
    ctx: {
      relays: [...relays, ...FALLBACK_RELAYS],
      relayHints: mergeRelayHints([relayHints || {}, nip19ToRelayHints(decoded)]),
    },
    select: (events) => events[0],
  })
}

export function useEvent(id: string = '', ctx?: NostrContext) {
  return useQuery(
    eventQueryOptions({
      queryKey: queryKeys.event(id),
      filter: { ids: [id] },
      enabled: !!id,
      placeholderData: keepPreviousData,
      ctx,
      select: (events) => events[0],
    }),
  )
}

export function useEventAddress(kind: Kind, pubkey: string, identifier: string, relayHints?: RelayHints) {
  return useQuery(
    eventQueryOptions({
      queryKey: queryKeys.addressable(kind, pubkey, identifier),
      filter: { kinds: [kind], authors: [pubkey], '#d': [identifier] },
      ctx: {
        relays: FALLBACK_RELAYS,
        relayHints,
      },
      select: (events) => events[0],
    }),
  )
}

export function useEventFromNIP19(nip19: string, relayHints?: RelayHints, keepPrevious?: boolean) {
  const decoded = decodeNIP19(nip19.replace('nostr:', ''))
  const filter = decoded ? decodeToFilter(decoded) : undefined

  return useQuery({
    ...eventFromNIP19QueryOptions(nip19, relayHints),
    enabled: !!nip19 && !!filter,
    placeholderData: keepPrevious !== false ? keepPreviousData : undefined,
  })
}

export function useRepostedEvent(event: NostrEventDB) {
  const id = event.metadata?.mentionedNotes?.[0] || ''
  let initialData: [NostrEventDB] | undefined
  try {
    initialData =
      event.content && event.content !== '{}' ? [parseEventMetadata(JSON.parse(event.content || '{}'))] : undefined
  } catch {
    // invalid content json
  }
  return useQuery(
    eventQueryOptions({
      queryKey: queryKeys.event(id),
      filter: { ids: [id] },
      ctx: {
        relays: FALLBACK_RELAYS,
        relayHints: {
          ...event.metadata?.relayHints,
          ids: {
            [id]: [event.pubkey],
          },
        },
      },
      enabled: !!id,
      initialData,
      select: (events) => events[0],
    }),
  )
}

export function useReplaceableEvent<Selector = NostrEventDB>(
  kind: Kind,
  pubkey: string,
  options?: CustomQueryOptions<Selector>,
) {
  return useQuery(replaceableEventQueryOptions<Selector>(kind, pubkey, options))
}

export function useAddressableEvent(kind: Kind, pubkey: string, identifier: string) {
  return useQuery(
    createEventQueryOptions({
      queryKey: queryKeys.addressable(kind, pubkey, identifier),
      filter: {
        kinds: [kind],
        authors: [pubkey],
        '#d': [identifier],
      },
    }),
  )
}

export function useParentEvent(event: NostrEventDB) {
  const parentId = event.metadata?.parentId
  return useEvent(parentId, {
    relayHints: mergeRelayHints([
      parentId ? { ids: { [parentId]: FALLBACK_RELAYS } } : {},
      event.metadata?.relayHints || {},
    ]),
  })
}

export function useRootEvent(event: NostrEventDB) {
  const rootId = event.metadata?.rootId
  return useEvent(rootId, {
    relayHints: mergeRelayHints([
      rootId ? { ids: { [rootId]: FALLBACK_RELAYS } } : {},
      event.metadata?.relayHints || {},
    ]),
  })
}
