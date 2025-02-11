import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import type { NostrEventNote } from '../types'
import { subscribe } from './subscribe'
import { subscribeParent } from './subscribeParent'
import { withRelatedNotes } from './withRelatedNotes'

export function subscribeNotes(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ ...filter, kinds: [Kind.Text] }, ctx).pipe(ofKind<NostrEventNote>([Kind.Text]))
}

export function subscribeNotesWithRelated(filter: NostrFilter, ctx: NostrContext) {
  return subscribeNotes(filter, ctx).pipe(withRelatedNotes(ctx))
}

export function subscribeNotesWithParent(filter: NostrFilter, ctx: NostrContext) {
  return subscribeNotesWithRelated(filter, ctx).pipe(subscribeParent(ctx))
}
