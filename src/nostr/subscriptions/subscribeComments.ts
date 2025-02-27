import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import { subscribe } from './subscribe'

const kinds = [Kind.Comment]

export function subscribeComments(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ ...filter, kinds }, ctx)
}
