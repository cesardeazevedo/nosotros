import { Kind } from '@/constants/kinds'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { ofKind } from '@/core/operators/ofKind'
import { of, tap } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import type { NostrEventRelayList } from '../types'

export const replay = new ShareReplayCache<NostrEventRelayList>()

const kinds = [Kind.RelayList]

export const subscribeRelayList = replay.wrap((pubkey: string, client: NostrClient, options?: ClientSubOptions) => {
  const filter = { kinds, authors: [pubkey] }
  const subOptions = { relays: of(OUTBOX_RELAYS), ...options }
  return client.subscribe(filter, subOptions).pipe(
    ofKind<NostrEventRelayList>(kinds),
    tap((event) => client.mailbox.emit(event)),
  )
})
