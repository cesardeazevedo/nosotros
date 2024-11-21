import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { userRelayStore } from '@/stores/nostr/userRelay.store'
import { Kind } from 'constants/kinds'
import { OUTBOX_RELAYS } from 'constants/relays'
import type { NostrEvent } from 'nostr-tools'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { Observable } from 'rxjs'
import { map, of } from 'rxjs'
import { ShareReplayCache } from '../replay'

export interface UserRelayDB {
  pubkey: string
  relay: string
  permission: 'read' | 'write' | undefined
}

export const replay = new ShareReplayCache<UserRelayDB[]>()

export class NIP65RelayList {
  constructor(private client: NostrClient) {}

  parse(event: NostrEvent) {
    return event.tags
      .filter((tag) => tag[0] === 'r')
      .map((tag) => {
        return {
          pubkey: event.pubkey,
          relay: formatRelayUrl(tag[1]),
          permission: tag[2] as UserRelayDB['permission'],
        } as UserRelayDB
      })
  }

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions): Observable<UserRelayDB[]> => {
    const filter = { kinds: [Kind.RelayList], authors: [pubkey] }
    return this.client.subscribe(filter, { relays: of(OUTBOX_RELAYS), ...options }).pipe(
      map((event) => {
        const userRelay = this.parse(event)
        userRelayStore.add(event.pubkey, userRelay)
        this.client.mailbox.emit(event)
        return userRelay
      }),
    )
  })
}
