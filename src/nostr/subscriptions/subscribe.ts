import type { NostrFilter } from '@/core/types'
import { verifyWorker } from '@/nostr/operators/verifyWorker'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'
import type { Observable } from 'rxjs'
import { mergeWith, of, tap } from 'rxjs'
import { batchers } from '../batcher'
import type { NostrContext } from '../context'
import { querySub } from '../db/querySub'
import { distinctEvent } from '../operators/distinctEvents'
import { insert } from '../operators/insert'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { seen } from '../seen'
import type { NostrEventMetadata } from '../types'
import { createSubscription } from './createSubscription'
import { subscribeAfterAuth } from './subscribeAfterAuth'
import { subscribeMediaStats } from './subscribeMediaStats'

export function subscribe(filters: NostrFilter, ctx: NostrContext) {
  const sub = createSubscription(filters, ctx)
  return of(sub).pipe(
    mergeWith(subscribeAfterAuth(sub, ctx)),

    batchers[ctx.batcher || 'lazy'](),

    tap(([relay, event]) => seen.insert(relay, event)),

    distinctEvent(sub),

    verifyWorker(),

    insert(ctx),

    mergeWith(querySub(sub, ctx)),

    parseEventMetadata(),

    subscribeMediaStats(),

    tap((event) => addNostrEventToStore(event)),
  ) as Observable<NostrEventMetadata>
}
