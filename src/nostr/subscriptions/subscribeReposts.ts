import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { EMPTY, filter, ignoreElements, map, merge, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventMetadata } from '../types'
import { metadataSymbol, WRITE } from '../types'
import { subscribe } from './subscribe'
import { subscribeNotesWithRelated } from './subscribeNotes'
import { subscribeUser } from './subscribeUser'

const kinds = [Kind.Repost]

export function withRepostedEvent(ctx: NostrContext) {
  return mergeMap((event: NostrEventMetadata) => {
    const metadata = event[metadataSymbol]
    const relayHints = metadata.relayHints
    const id = metadata.mentionedNotes?.[0]
    const author = metadata.tags?.p?.[0][1]
    if (id) {
      const relatedCtx = {
        ...ctx,
        pubkey: author,
        permission: WRITE,
        subOptions: { relayHints, prune: false },
      }
      return merge(
        // get repost author
        subscribeUser(event.pubkey, ctx).pipe(ignoreElements()),
        // get inner note
        subscribeNotesWithRelated({ ids: [id] }, relatedCtx).pipe(
          filter((event) => event.id === id),
          map(() => event),
        ),
      )
    }
    return EMPTY
  })
}

export function subscribeReposts(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ ...filter, kinds }, ctx).pipe(
    // Only return reposts after getting the actual reposted event
    withRepostedEvent(ctx),
  )
}
