import { Kind } from '@/constants/kinds'
import { dedupe } from '@/core/helpers/dedupe'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { Observable } from 'rxjs'
import { connect, from, ignoreElements, merge, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { metadataSymbol, type NostrEventZapReceipt } from '../types'
import { subscribe } from './subscribe'
import { subscribeUser } from './subscribeUser'

const kinds = [Kind.ZapReceipt]

export function withZapAuthor(ctx: NostrContext) {
  return connect((shared$: Observable<NostrEventZapReceipt>) => {
    return merge(
      shared$,
      shared$.pipe(
        mergeMap((event) => {
          // Get zapper and receiver authors
          const metadata = event[metadataSymbol]
          const authors = dedupe([metadata.receiver, metadata.zapper])
          return from(authors).pipe(mergeMap((pubkey) => subscribeUser(pubkey, ctx)))
        }),
        ignoreElements(),
      ),
    )
  })
}

export function subscribeZaps(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ ...filter, kinds }, ctx).pipe(ofKind<NostrEventZapReceipt>(kinds))
}
