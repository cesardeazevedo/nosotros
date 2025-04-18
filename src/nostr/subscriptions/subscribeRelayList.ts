import { Kind } from '@/constants/kinds'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { NostrSubscription } from '@/core/NostrSubscription'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'
import { mergeWith, of, tap } from 'rxjs'
import { batchers } from '../batcher'
import type { NostrContext } from '../context'
import { querySub } from '../db/querySub'
import { distinctEvent } from '../operators/distinctEvents'
import { insert } from '../operators/insert'
import { parseMetadata } from '../operators/parseMetadata'
import { verifyWorker } from '../operators/verifyWorker'
import { ShareReplayCache } from '../replay'
import { parseRelayList, type NostrEventMetadata } from '../types'

export const replay = new ShareReplayCache<NostrEventMetadata>()

export const subscribeRelayList = replay.wrap((pubkey: string, ctx: NostrContext) => {
  // We don't use the `createSubscription` helper here to avoid circular references.
  const filter = { kinds: [Kind.RelayList], authors: [pubkey] }
  const sub = new NostrSubscription(filter, { relays: of(OUTBOX_RELAYS) })
  return of(sub).pipe(
    batchers.eager(),
    distinctEvent(sub),
    verifyWorker(),
    insert(ctx),
    mergeWith(querySub(sub, { ...ctx, queryDB: true })),
    parseMetadata(parseRelayList),
    tap((event) => addNostrEventToStore(event)),
  )
})
