import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import { subscribe } from './subscribe'

const kinds = [Kind.Article]

export function subscribeArticles(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ kinds, ...filter }, ctx)
}
