import { userRelayStore } from '@/stores/userRelays/userRelay.store'
import { Kind } from 'constants/kinds'
import { OUTBOX_RELAYS } from 'constants/relays'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { Observable } from 'rxjs'
import { map, of } from 'rxjs'
import { parseRelayList } from '../helpers/parseRelayList'
import { ShareReplayCache } from '../replay'

export interface UserRelayDB {
  pubkey: string
  relay: string
  permission: number
}

export const READ = 1 << 0
export const WRITE = 1 << 1
export const PERMISSIONS = { READ, WRITE }

export const replay = new ShareReplayCache<UserRelayDB[]>()

export class NIP65RelayList {
  constructor(private client: NostrClient) {}

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions): Observable<UserRelayDB[]> => {
    const filter = { kinds: [Kind.RelayList], authors: [pubkey] }
    return this.client.subscribe(filter, { relays: of(OUTBOX_RELAYS), ...options }).pipe(
      map((event) => {
        const userRelay = parseRelayList(event)
        userRelayStore.add(event.pubkey, userRelay)
        this.client.mailbox.emit(event)
        return userRelay
      }),
    )
  })
}
