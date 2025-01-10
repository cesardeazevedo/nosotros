import { dedupe } from '@/core/helpers/dedupe'
import type { NostrFilter } from '@/core/types'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { Observable } from 'rxjs'
import { connect, from, ignoreElements, merge, mergeMap } from 'rxjs'
import type { NostrEventZapReceipt } from '../types'
import { metadataSymbol } from '../types'

const kinds = [Kind.ZapReceipt]

export class NIP57Zaps {
  constructor(private client: NostrClient) {}

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
    return this.client.subscribe({ kinds, ...filter }, { ...options, cacheFilter: { kinds, ...options?.cacheFilter } })
  }
}
