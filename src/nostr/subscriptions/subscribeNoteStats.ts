import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import { from, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { NoteStatsOptions } from '../helpers/getNoteStatsFilters'
import { getNoteStatsFilters } from '../helpers/getNoteStatsFilters'
import { ShareReplayCache } from '../replay'
import type { NostrEventMetadata } from '../types'
import { READ } from '../types'
import { subscribe } from './subscribe'
import { withRelatedAuthors } from './withRelatedAuthor'

export const replay = new ShareReplayCache<NostrEventMetadata>()

const subscribeNoteStatsCached = replay.wrap((_id: string, filters: NostrFilter[], ctx: NostrContext) => {
  return from(filters).pipe(mergeMap((filter) => subscribe(filter, ctx)))
})

export function subscribeNoteStats(event: NostrEvent, baseCtx: NostrContext, options: NoteStatsOptions) {
  const filters = getNoteStatsFilters(event, options)
  const ctx = { ...baseCtx, pubkey: event.pubkey, permission: READ }
  return subscribeNoteStatsCached(event.id, filters, ctx).pipe(
    // get authors only from text and comment
    ofKind([Kind.Text, Kind.Comment]),
    withRelatedAuthors(ctx),
  )
}
