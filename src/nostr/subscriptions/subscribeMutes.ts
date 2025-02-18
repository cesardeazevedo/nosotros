import { Kind } from '@/constants/kinds'
import type { NostrContext } from '../context'
import { subscribe } from './subscribe'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeMutes(pubkey: string, ctx: NostrContext) {
  return subscribe({ kinds: [Kind.Mutelist], authors: [pubkey] }, ctx).pipe(withRelatedAuthors(ctx))
}
