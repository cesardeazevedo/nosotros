import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import type { NostrEventNote } from '../types'
import { subscribe } from './subscribe'

const kinds = [Kind.Article]

export function subscribeArticles(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ kinds, ...filter }, ctx).pipe(ofKind<NostrEventNote>(kinds))
}
