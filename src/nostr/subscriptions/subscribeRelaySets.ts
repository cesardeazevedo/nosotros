import { Kind } from '@/constants/kinds'
import { NostrSubscription } from '@/core/NostrSubscription'
import type { NostrFilter } from '@/core/types'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'
import { EMPTY, from, map, mergeMap, mergeWith, of, tap } from 'rxjs'
import { batchers } from '../batcher'
import type { NostrContext } from '../context'
import { querySub } from '../db/querySub'
import { distinctEvent } from '../operators/distinctEvents'
import { insert } from '../operators/insert'
import { verifyWorker } from '../operators/verifyWorker'
import { ShareReplayCache } from '../replay'
import { WRITE } from '../types'
import { subscribeOutboxRelays } from './subscribeMailbox'

const replay = new ShareReplayCache<string[]>()

const subscribeRelaySetsFromId = replay.wrap((key: string, ctx: NostrContext) => {
  const [pubkey, d] = key.split(':')
  const filter = { kinds: [Kind.RelaySets], authors: [pubkey] } as NostrFilter
  if (d) {
    filter['#d'] = [d]
  }
  const sub = new NostrSubscription(filter, {
    relays: subscribeOutboxRelays({ ...ctx, pubkey: filter.authors?.[0], permission: WRITE }),
  })
  return of(sub).pipe(
    batchers.raw(),
    distinctEvent(sub),
    verifyWorker(),
    insert(ctx),
    mergeWith(querySub(sub, { ...ctx, queryDB: true })),
    tap((event) => addNostrEventToStore(event)),
    map((event) => event.tags.filter(([tag]) => tag === 'relay').map(([, relay]) => relay)),
  )
})

export const subscribeRelaySetsFromContext = (ctx: NostrContext) => {
  if (!ctx.relaySets) return EMPTY
  return from(ctx.relaySets || []).pipe(mergeMap((key) => subscribeRelaySetsFromId(key, ctx)))
}
