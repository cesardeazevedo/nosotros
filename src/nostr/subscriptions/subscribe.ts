import type { NostrFilter } from '@/core/types'
import { verifyWorker } from '@/nostr/operators/verifyWorker'
import { mergeWith, of, tap } from 'rxjs'
import { batcher } from '../batcher'
import type { NostrContext } from '../context'
import { distinctEvent } from '../operators/distinctEvents'
import { insert } from '../operators/insert'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { query } from '../operators/query'
import { seen } from '../seen'
import { createSubscription } from './createSubscription'

export function subscribe(filters: NostrFilter, ctx: NostrContext) {
  const sub = createSubscription(filters, ctx)

  return of(sub).pipe(
    batcher.subscribe(),

    tap(([relay, event]) => seen.insert(relay, event)),

    distinctEvent(sub),

    verifyWorker(),

    insert(ctx),

    mergeWith(query(sub, ctx)),

    parseEventMetadata(),

    tap(ctx.onEvent),
  )
}
