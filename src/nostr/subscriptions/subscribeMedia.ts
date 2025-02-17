import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import type { NostrEventMedia } from '../types'
import { subscribe } from './subscribe'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeMedia(filter: NostrFilter, ctx: NostrContext) {
  return subscribe(filter, ctx).pipe(ofKind<NostrEventMedia>([Kind.Media]), withRelatedAuthors(ctx))
}
