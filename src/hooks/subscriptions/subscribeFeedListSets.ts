import { selectedPubkeyAtom, signerAtom } from '@/atoms/auth.atoms'
import { store } from '@/atoms/store'
import type { NostrFilter, RelayHints } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import { isAddressableKind } from 'nostr-tools/kinds'
import { EMPTY, from, map, mergeMap } from 'rxjs'
import invariant from 'tiny-invariant'
import { queryClient } from '../query/queryClient'
import { addressableEventQueryOptions, replaceableEventQueryOptions } from '../query/useQueryBase'
import { subscribeStrategy } from './subscribeStrategy'

const selectFirstEvent = (events: NostrEventDB[]) => events[0]

async function fetchListEvent(filter: NostrFilter, kind: number, pubkey: string) {
  if (isAddressableKind(kind)) {
    const d = filter['#d']?.[0]
    invariant(d, 'Missing d tag on subscribeFeedListP')
    return await queryClient.fetchQuery(
      addressableEventQueryOptions<NostrEventDB | undefined>(kind, pubkey, d, {
        select: selectFirstEvent,
      }),
    )
  }

  return await queryClient.fetchQuery(
    replaceableEventQueryOptions<NostrEventDB | undefined>(kind, pubkey, {
      select: selectFirstEvent,
    }),
  )
}

async function fetchList(filter: NostrFilter) {
  const pubkey = filter.authors?.[0]
  const kind = filter.kinds?.[0]
  invariant(kind, 'Missing d tag on subscribeFeedListP')
  invariant(pubkey, 'Missing author on subscribeFeedListP')

  const decryptListEvent = async (event: NostrEventDB | undefined) => {
    if (!event) {
      return undefined
    }
    const signer = store.get(signerAtom)
    const currentPubkey = store.get(selectedPubkeyAtom)
    if (!event.content || !signer || !currentPubkey) {
      return event
    }
    try {
      const decrypted = await signer.decrypt(currentPubkey, event.content)
      const privateTags = parseTags(decrypted)
      return { ...event, tags: mergeTags(event.tags, privateTags) }
    } catch {
      return event
    }
  }

  const event = await fetchListEvent(filter, kind, pubkey)
  const listEvent = Array.isArray(event) ? event[0] : event
  return await decryptListEvent(listEvent)
}

const parseTags = (content: string) => {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      return parsed.filter((tag) => Array.isArray(tag)).map((tag) => tag.map((value) => String(value)))
    }
  } catch {
    return undefined
  }
  return undefined
}

const mergeTags = (publicTags: string[][], privateTags?: string[][]) => {
  if (!privateTags?.length) {
    return publicTags
  }
  const mapByKey = new Map<string, string[][]>()
  const append = (tag: string[]) => {
    const key = `${tag[0] || ''}:${tag[1] || ''}`
    const list = mapByKey.get(key) || []
    const exists = list.some((entry) => entry[2] === tag[2] && entry[3] === tag[3])
    if (!exists) {
      list.push(tag)
      mapByKey.set(key, list)
    }
  }
  for (const tag of publicTags) {
    append(tag)
  }
  for (const tag of privateTags) {
    append(tag)
  }
  return [...mapByKey.values()].flat()
}

export function subscribeFeedListSetsP(ctx: NostrContext, filter: NostrFilter) {
  return from(fetchList(filter)).pipe(
    mergeMap((event) => {
      if (!event) {
        return EMPTY
      }
      const authors = event.tags.filter((x: string[]) => x[0] === 'p').map((x: string[]) => x[1]) || []
      const { '#d': _, kinds: allKinds, ...rest } = filter
      const [, ...kinds] = allKinds || []
      return subscribeStrategy(ctx, { ...rest, kinds, authors })
    }),
  )
}

export function subscribeFeedListSetsE(ctx: NostrContext, filter: NostrFilter) {
  return from(fetchList(filter)).pipe(
    mergeMap((event) => {
      if (!event) {
        return EMPTY
      }
      const ids = event.tags.filter((x: string[]) => x[0] === 'e').map((x: string[]) => x[1]) || []
      const relayHints: RelayHints = {
        idHints: {
          ...ids.reduce((acc: Record<string, string[]>, id: string) => ({ ...acc, [id]: [event.pubkey] }), {}),
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
    mergeMap((event) => {
      if (!event) {
        return EMPTY
      }
      const relays = event.tags.filter((tag: string[]) => tag[0] === 'relay').map((tag: string[]) => tag[1])
      const { '#d': _, kinds: allKinds, authors, ...rest } = filter
      const [, ...kinds] = allKinds || []
      return subscribeStrategy({ ...ctx, network: 'REMOTE_ONLY', relays }, { ...rest, kinds })
    }),
  )
}
