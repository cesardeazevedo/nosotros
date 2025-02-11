import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import { ShareReplayCache } from '../replay'
import type { NostrEventComment, NostrEventNote } from '../types'
import { subscribeNotesWithRelated } from './subscribeNotes'

const replay = new ShareReplayCache<NostrEventNote | NostrEventComment>()

const kinds = [Kind.Text]

// NIP-10 replies
export const subscribeRepliesFromId = replay.wrap((_id: string, filter: NostrFilter, ctx: NostrContext) => {
  return subscribeNotesWithRelated({ ...filter, kinds }, ctx)
})
