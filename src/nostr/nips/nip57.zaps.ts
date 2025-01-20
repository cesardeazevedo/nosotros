import { dedupe } from '@/core/helpers/dedupe'
import { start } from '@/core/operators/start'
import { verify } from '@/core/operators/verify'
import type { NostrFilter } from '@/core/types'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { Observable } from 'rxjs'
import { connect, filter, from, ignoreElements, merge, mergeMap, of, tap } from 'rxjs'
import { parseTags } from '../helpers/parseTags'
import { distinctEvent } from '../operators/distinctEvents'
import { parseEventMetadata } from '../operators/parseMetadata'
import type { NostrEventZapReceipt } from '../types'
import { metadataSymbol } from '../types'

const kinds = [Kind.ZapReceipt]

export class NIP57Zaps {
  constructor(private client: NostrClient) {}

  waitForReceipt(id: string, invoice: string, options?: ClientSubOptions) {
    const sub = this.client.createSubscription({ kinds, '#e': [id] }, options)
    return of(sub).pipe(
      start(this.client.pool, false),
      distinctEvent(),
      verify(),
      this.client.insert(),
      parseEventMetadata(),
      tap(this.client.options.onEvent),
      filter((event) => {
        // Make sure the zap receipt is the one we are looking for
        const tags = parseTags(event.tags)
        return tags.bolt11?.[0][1] === invoice
      }),
    )
  }

  withRelatedAuthors() {
    return connect((shared$: Observable<NostrEventZapReceipt>) => {
      return merge(
        shared$,
        shared$.pipe(
          mergeMap((event) => {
            // Get zapper and receiver authors
            const metadata = event[metadataSymbol]
            const authors = dedupe([metadata.receiver, metadata.zapper])
            return from(authors).pipe(mergeMap((pubkey) => this.client.users.subscribe(pubkey)))
          }),
          ignoreElements(),
        ),
      )
    })
  }

  subscribe(filter: NostrFilter, options?: ClientSubOptions) {
    return this.client.subscribe({ ...filter, kinds }, options)
  }
}
