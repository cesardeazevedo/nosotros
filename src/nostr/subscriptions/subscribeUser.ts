import { Kind } from '@/constants/kinds'
import { from, mergeMap, tap } from 'rxjs'
import type { NostrContext } from '../context'
import { nip05 } from '../nip05'
import { ShareReplayCache } from '../replay'
import type { NostrEventMetadata } from '../types'
import { metadataSymbol, WRITE } from '../types'
import { subscribe } from './subscribe'

const kinds = [Kind.Metadata]

export const replay = new ShareReplayCache<NostrEventMetadata>()

export const subscribeUser = replay.wrap((pubkey: string, ctx: NostrContext) => {
  const filter = { kinds, authors: [pubkey] }
  return subscribe(filter, {
    ...ctx,
    pubkey,
    outbox: false,
    queryDB: true,
    permission: WRITE,
    batcher: 'lazy',
  }).pipe(
    tap((event) => {
      if (ctx.nip05) {
        nip05.enqueue((event as NostrEventMetadata)[metadataSymbol].userMetadata?.nip05)
      }
    }),
  )
})

export const subscribeUsers = (pubkeys: string[], ctx: NostrContext) => {
  return from(pubkeys).pipe(mergeMap((pubkey) => subscribeUser(pubkey, ctx)))
}
