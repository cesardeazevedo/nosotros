import { Kind } from '@/constants/kinds'
import { NostrSubscription } from '@/core/NostrSubscription'
import type { NostrEvent } from 'nostr-tools'
import { filter, from, map, mergeWith, pipe, Subject, take, takeUntil, timer } from 'rxjs'
import type { RelaySelectionConfig } from './helpers/relaySelection'
import { selectRelays } from './helpers/relaySelection'
import type { UserRelayDB } from './nips/nip65.relaylist'
import type { NostrClient } from './nostr'
import { ShareReplayCache } from './replay'

export const toArrayRelay = pipe(map((data: UserRelayDB[]) => data.map((x) => x.relay)))

export const replay = new ShareReplayCache<UserRelayDB[]>()

export class Mailbox {
  private updates = new Subject<[string, NostrEvent]>()
  updates$ = this.updates.asObservable()

  constructor(private client: NostrClient) {}

  private subscribe = replay.wrap((pubkey: string) => {
    const sub = new NostrSubscription({ kinds: [Kind.RelayList], authors: [pubkey], limit: 1 })
    return from(this.client.query(sub)).pipe(
      map((event) => this.client.relayList.parse(event)),
      filter((x) => x.length > 0),
    )
  })

  track(pubkey: string, config?: RelaySelectionConfig) {
    const stream = this.subscribe(pubkey).pipe(
      mergeWith(
        this.updates$.pipe(
          filter((x) => x[0] === pubkey),
          map(([, event]) => this.client.relayList.parse(event)),
          takeUntil(timer(config?.timeout || 4000)),
        ),
      ),
      take(1),
    )
    return stream.pipe(map((data) => selectRelays(data, config)))
  }

  emit(event: NostrEvent) {
    this.updates.next([event.pubkey, event])
  }
}
