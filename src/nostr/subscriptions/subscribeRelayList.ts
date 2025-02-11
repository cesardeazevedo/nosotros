import { Kind } from '@/constants/kinds'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { ofKind } from '@/core/operators/ofKind'
import { of, tap } from 'rxjs'
import type { NostrContext } from '../context'
import { emitMailbox } from '../operators/trackMailbox'
import { ShareReplayCache } from '../replay'
import type { NostrEventRelayList } from '../types'
import { subscribe } from './subscribe'

export const replay = new ShareReplayCache<NostrEventRelayList>()

const kinds = [Kind.RelayList]

export const subscribeRelayList = replay.wrap((pubkey: string, ctx: NostrContext) => {
  const filter = { kinds, authors: [pubkey] }
  const subOptions = { ...ctx.subOptions, relays: of(OUTBOX_RELAYS) }
  return subscribe(filter, { ...ctx, subOptions }).pipe(
    ofKind<NostrEventRelayList>(kinds),
    tap((event) => emitMailbox(event)),
  )
})
