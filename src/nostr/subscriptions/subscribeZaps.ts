import { Kind } from '@/constants/kinds'
import { dedupe } from '@/core/helpers/dedupe'
import type { NostrFilter } from '@/core/types'
import type { Observable } from 'rxjs'
import { connect, from, ignoreElements, merge, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventMetadata } from '../types'
import { metadataSymbol } from '../types'
import { subscribe } from './subscribe'
import { subscribeUser } from './subscribeUser'

const kinds = [Kind.ZapReceipt]

export function withZapAuthor(ctx: NostrContext) {
  return connect((shared$: Observable<NostrEventMetadata>) => {
    return merge(
      shared$,
      shared$.pipe(
        mergeMap((event) => {
          // Get zapper and receiver authors
          const { tags } = event[metadataSymbol]
          const zapper = tags?.P?.[0][1]
          const receiver = tags?.p?.[0][1]
          const authors = dedupe([receiver, zapper])
          return from(authors).pipe(mergeMap((pubkey) => subscribeUser(pubkey, ctx)))
        }),
        ignoreElements(),
      ),
    )
  })
}

export function subscribeZaps(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ ...filter, kinds }, ctx)
}
