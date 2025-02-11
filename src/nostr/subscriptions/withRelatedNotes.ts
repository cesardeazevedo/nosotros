import { connect, ignoreElements, merge } from 'rxjs'
import type { NostrContext } from '../context'
import { subscribeAuthorsFromNote } from './subscribeNoteAuthors'
import type { QuoteOptions } from './subscribeQuotes'
import { subscribeQuotes } from './subscribeQuotes'
import type { Note$ } from './subscribeThreads'

type RelatedOptions = {
  quotes?: QuoteOptions
}

export function withRelatedNotes(ctx: NostrContext, options?: RelatedOptions) {
  return connect((event$: Note$) => {
    return merge(
      event$,
      event$.pipe(subscribeAuthorsFromNote(ctx), ignoreElements()),
      event$.pipe(subscribeQuotes(ctx, options?.quotes), ignoreElements()),
    )
  })
}
