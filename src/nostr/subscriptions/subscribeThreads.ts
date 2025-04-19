import { Kind } from '@/constants/kinds'
import type { Observable } from 'rxjs'
import { EMPTY, merge, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventMetadata } from '../types'
import { metadataSymbol, READ, WRITE } from '../types'
import { subscribeNotesWithRelated } from './subscribeNotes'

export function subscribeThreads(ctx: NostrContext) {
  return (source$: Observable<NostrEventMetadata>) => {
    return source$.pipe(
      mergeMap((event) => {
        const meta = event[metadataSymbol]
        const rootId = meta.rootId
        // try to get the pubkey mark from e root tag, otherwise the first and hope it's the root author of the thread
        const rootPubkey = meta.tags?.e?.find(([, , , mark]) => mark === 'root')?.[4] || meta.mentionedAuthors?.[0]
        if (rootId) {
          const relatedCtx = { ...ctx, pubkey: rootPubkey } as NostrContext
          return merge(
            // Get the root note of the thread
            subscribeNotesWithRelated({ ids: [rootId] }, { ...relatedCtx, permission: WRITE }),
            // Get all the replies of the root note of the thread
            subscribeNotesWithRelated({ kinds: [Kind.Text], '#e': [rootId] }, { ...relatedCtx, permission: READ }), // inbox of the author
          )
        }
        return EMPTY
      }),
    )
  }
}
