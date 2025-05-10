import { Kind } from '@/constants/kinds'
import { start } from '@/core/operators/start'
import { verify } from '@/core/operators/verify'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'
import { filter, of, tap } from 'rxjs'
import type { NostrContext } from '../context'
import { parseTags } from '../helpers/parseTags'
import { distinctEvent } from '../operators/distinctEvents'
import { insert } from '../operators/insert'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { pool } from '../pool'
import { createSubscription } from './createSubscription'

const kinds = [Kind.ZapReceipt]

export function waitForZapReceipt(id: string, invoice: string, ctx: NostrContext) {
  const sub = createSubscription({ kinds, '#e': [id] }, ctx)
  return of(sub).pipe(
    start(pool, false),
    distinctEvent(sub),
    verify(),
    insert(ctx),
    parseEventMetadata(),
    tap((event) => addNostrEventToStore(event)),
    filter((event) => {
      // Make sure the zap receipt is the one we are looking for
      const tags = parseTags(event.tags)
      return tags.bolt11?.[0][1] === invoice
    }),
  )
}
