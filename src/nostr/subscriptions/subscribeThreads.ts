import { Kind } from '@/constants/kinds'
import type { Observable } from 'rxjs'
import { EMPTY, merge, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventComment, NostrEventNote } from '../types'
import { metadataSymbol } from '../types'
import { subscribeNotesWithRelated } from './subscribeNotes'

export type Note$ = Observable<NostrEventNote | NostrEventComment>

export function subscribeThreads(ctx: NostrContext) {
  return (source$: Note$) => {
    return source$.pipe(
      mergeMap((event) => {
        const rootId = event[metadataSymbol].rootId
        if (rootId) {
          return merge(
            subscribeNotesWithRelated({ ids: [rootId] }, ctx),
            subscribeNotesWithRelated({ kinds: [Kind.Text], '#e': [rootId] }, ctx),
          )
        }
        return EMPTY
      }),
    )
  }
}
