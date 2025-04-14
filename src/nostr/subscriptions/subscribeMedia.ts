import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import { subscribe } from './subscribe'
import { withRelatedAuthors } from './withRelatedAuthor'

const kinds = [Kind.Media]

export function subscribeMedia(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ ...filter, kinds }, ctx).pipe(withRelatedAuthors(ctx))
}
