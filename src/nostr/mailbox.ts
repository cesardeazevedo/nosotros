import { Kind } from '@/constants/kinds'
import { NostrSubscription } from '@/core/NostrSubscription'
import type { NostrEvent } from 'nostr-tools'
import { filter, from, map, mergeWith, pipe, shareReplay, Subject, take, takeUntil, tap, timer } from 'rxjs'
import type { UserRelay } from './helpers/parseRelayList'
import { parseRelayList } from './helpers/parseRelayList'
import type { RelaySelectionConfig } from './helpers/selectRelays'
import { selectRelays } from './helpers/selectRelays'
import type { NostrClient } from './nostr'
import { mergeMetadata } from './operators/mapMetadata'
import { ShareReplayCache } from './replay'
import { metadataSymbol } from './types'

export const toArrayRelay = pipe(map((data: UserRelay[]) => data.map((x) => x.relay)))

export const replay = new ShareReplayCache<UserRelay[]>()

export class Mailbox {
  private updates = new Subject<[string, NostrEvent]>()
  updates$ = this.updates.asObservable()

  constructor(private client: NostrClient) {}

  private subscribe = replay.wrap((pubkey: string) => {
    const sub = new NostrSubscription({ kinds: [Kind.RelayList], authors: [pubkey] })
    return from(this.client.query(sub)).pipe(
      mergeMetadata(parseRelayList),
      tap((x) => this.client.options.onEvent?.(x)),
      map((x) => x[metadataSymbol].relayList),
      filter((x) => x.length > 0),
    )
  })

  track(pubkey: string, config?: RelaySelectionConfig) {
    const stream = this.subscribe(pubkey).pipe(
      mergeWith(
        this.updates$.pipe(
          filter((x) => x[0] === pubkey),
          map(([, event]) => parseRelayList(event).relayList),
          takeUntil(timer(config?.timeout || 2000)),
        ),
      ),
      take(1),
      shareReplay(1),
    )
    return stream.pipe(map((data) => selectRelays(data, config)))
  }

  emit(event: NostrEvent) {
    this.updates.next([event.pubkey, event])
  }
}
