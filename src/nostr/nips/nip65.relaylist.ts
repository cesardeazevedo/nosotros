import { ofKind } from '@/core/operators/ofKind'
import { Kind } from 'constants/kinds'
import { OUTBOX_RELAYS } from 'constants/relays'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { of, tap } from 'rxjs'
import { ShareReplayCache } from '../replay'
import type { NostrEventRelayList } from '../types'

export const replay = new ShareReplayCache<NostrEventRelayList>()

const kinds = [Kind.RelayList]

export class NIP65RelayList {
  constructor(private client: NostrClient) {}

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions) => {
    const filter = { kinds, authors: [pubkey] }
    const subOptions = { relays: of(OUTBOX_RELAYS), ...options }
    return this.client.subscribe(filter, subOptions).pipe(
      ofKind<NostrEventRelayList>(kinds),
      tap((event) => this.client.mailbox.emit(event)),
    )
  })
}
