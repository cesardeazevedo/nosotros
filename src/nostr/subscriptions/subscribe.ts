import type { NostrFilter } from '@/core/types'
import { verifyWorker } from '@/nostr/operators/verifyWorker'
import { mergeWith, of, tap } from 'rxjs'
import { batcher } from '../batcher'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { distinctEvent } from '../operators/distinctEvents'
import { insert } from '../operators/insert'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { query } from '../operators/query'
import { createSubscription } from './createSubscription'

export function subscribe(filters: NostrFilter | NostrFilter[], client: NostrClient, options?: ClientSubOptions) {
  const sub = createSubscription(filters, client, options)

  return of(sub).pipe(
    batcher.subscribe(),

    tap(([relay, event]) => client.seen.insert(relay, event)),

    distinctEvent(sub),

    verifyWorker(),

    insert(client, options),

    mergeWith(query(client, sub, options)),

    parseEventMetadata(),

    tap(client.options.onEvent),
  )
}
