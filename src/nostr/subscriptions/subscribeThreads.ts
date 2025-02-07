import { Kind } from '@/constants/kinds'
import type { Observable } from 'rxjs'
import { EMPTY, merge, mergeMap } from 'rxjs'
import type { NostrClient } from '../nostr'
import type { NostrEventComment, NostrEventNote } from '../types'
import { metadataSymbol } from '../types'
import { subscribeNotesWithRelated } from './subscribeNotes'

export type Note$ = Observable<NostrEventNote | NostrEventComment>

export function subscribeThreads(client: NostrClient) {
  return (source$: Note$) => {
    return source$.pipe(
      mergeMap((event) => {
        const rootId = event[metadataSymbol].rootId
        if (rootId) {
          return merge(
            subscribeNotesWithRelated({ ids: [rootId] }, client),
            subscribeNotesWithRelated({ kinds: [Kind.Text], '#e': [rootId] }, client),
          )
        }
        return EMPTY
      }),
    )
  }
}
