import { Kind } from '@/constants/kinds'
import { NostrSubscription } from '@/core/NostrSubscription'
import type { NostrEvent } from 'nostr-tools'
import { filter, from, map, mergeWith, shareReplay, Subject, take, takeUntil, tap, timer } from 'rxjs'
import type { NostrContext } from '../context'
import type { RelaySelectionConfig } from '../helpers/selectRelays'
import { selectRelays } from '../helpers/selectRelays'
import { ShareReplayCache } from '../replay'
import type { UserRelay } from '../types'
import { metadataSymbol, parseRelayList } from '../types'
import { parseMetadata } from './parseMetadata'
import { query } from './query'

export const replay = new ShareReplayCache<UserRelay[]>()

const updates = new Subject<[string, NostrEvent]>()
export const updates$ = updates.asObservable()

export function emitMailbox(event: NostrEvent) {
  updates.next([event.pubkey, event])
}

const subscribeReplay = replay.wrap((pubkey: string, ctx: NostrContext) => {
  const sub = new NostrSubscription({ kinds: [Kind.RelayList], authors: [pubkey] })
  return from(query(sub, ctx)).pipe(
    parseMetadata(parseRelayList),
    tap((x) => ctx.onEvent?.(x)),
    map((x) => x[metadataSymbol].relayList),
    filter((x) => x.length > 0),
  )
})

export const trackMailbox = (pubkey: string, config: RelaySelectionConfig, ctx: NostrContext) => {
  const stream = subscribeReplay(pubkey, ctx).pipe(
    mergeWith(
      updates$.pipe(
        filter((x) => x[0] === pubkey),
        map(([, event]) => parseRelayList(event).relayList),
        takeUntil(timer(config?.timeout || 4000)),
      ),
    ),
    take(1),
    shareReplay(1),
  )
  return stream.pipe(map((data) => selectRelays(data, config)))
}

export const toArrayRelay = map((data: UserRelay[]) => data.map((x) => x.relay))
