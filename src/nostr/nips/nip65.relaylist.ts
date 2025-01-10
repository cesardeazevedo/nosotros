import { ofKind } from '@/core/operators/ofKind'
import { Kind } from 'constants/kinds'
import { OUTBOX_RELAYS } from 'constants/relays'
import type { NostrEvent } from 'nostr-tools'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { Observable } from 'rxjs'
import { of, tap } from 'rxjs'
import { ShareReplayCache } from '../replay'

export const replay = new ShareReplayCache<NostrEvent>()

const kinds = [Kind.RelayList]

export class NIP65RelayList {
  constructor(private client: NostrClient) {}

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions): Observable<NostrEvent> => {
    const filter = { kinds, authors: [pubkey] }
    const subOptions = { relays: of(OUTBOX_RELAYS), ...options }
    return this.client.subscribe(filter, subOptions).pipe(
      ofKind(kinds),
      tap((event) => this.client.mailbox.emit(event)),
    )
  })
}
