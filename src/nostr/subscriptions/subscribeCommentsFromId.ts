import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import { ShareReplayCache } from '../replay'
import type { NostrEventComment, NostrEventNote } from '../types'
import { subscribe } from './subscribe'
import { withRelatedNotes } from './withRelatedNotes'

const replay = new ShareReplayCache<NostrEventNote | NostrEventComment>()

const kinds = [Kind.Comment]

export const subscribeCommentsFromId = replay.wrap((_id: string, filter: NostrFilter, ctx: NostrContext) => {
  return subscribe({ ...filter, kinds }, ctx).pipe(ofKind<NostrEventComment>(kinds), withRelatedNotes(ctx))
})
