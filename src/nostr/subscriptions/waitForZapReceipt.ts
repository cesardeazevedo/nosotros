import { Kind } from '@/constants/kinds'
import { start } from '@/core/operators/start'
import { verify } from '@/core/operators/verify'
import { filter, of, tap } from 'rxjs'
import { parseTags } from '../helpers/parseTags'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { distinctEvent } from '../operators/distinctEvents'
import { insert } from '../operators/insert'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { createSubscription } from './createSubscription'

const kinds = [Kind.ZapReceipt]

export function waitForZapReceipt(id: string, invoice: string, client: NostrClient, options?: ClientSubOptions) {
  const sub = createSubscription({ kinds, '#e': [id] }, client, options)
  return of(sub).pipe(
    start(client.pool, false),
    distinctEvent(sub),
    verify(),
    insert(client),
    parseEventMetadata(),
    tap(client.options.onEvent),
    filter((event) => {
      // Make sure the zap receipt is the one we are looking for
      const tags = parseTags(event.tags)
      return tags.bolt11?.[0][1] === invoice
    }),
  )
}
