import { Kind } from '@/constants/kinds'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { ofKind } from '@/core/operators/ofKind'
import { connect, ignoreElements, merge, mergeMap, of, tap } from 'rxjs'
import { nip05 } from '../nip05'
import type { NostrContext } from '../context'
import { ShareReplayCache } from '../replay'
import { metadataSymbol, type NostrEventUserMetadata } from '../types'
import { subscribe } from './subscribe'
import { subscribeRelayList } from './subscribeRelayList'

const kinds = [Kind.Metadata]

export const replay = new ShareReplayCache<NostrEventUserMetadata>()

export const subscribeUser = replay.wrap((pubkey: string, ctx: NostrContext) => {
  const relayLists$ = subscribeRelayList(pubkey, ctx)

  const filter = { kinds, authors: [pubkey] }
  const subOptions = { ...ctx.subOptions, relays: of(OUTBOX_RELAYS) }
  const stream$ = subscribe(filter, { ...ctx, subOptions }).pipe(
    ofKind<NostrEventUserMetadata>(kinds),
    connect((shared) => {
      return merge(
        shared,
        shared.pipe(
          tap((event) => {
            if (ctx.settings.nip05) {
              nip05.enqueue(event[metadataSymbol].nip05)
            }
          }),
          mergeMap((event) => nip05.get(event[metadataSymbol].nip05)),
          ignoreElements(),
        ),
      )
    }),
  )
  return merge(stream$, relayLists$.pipe(ignoreElements()))
})
