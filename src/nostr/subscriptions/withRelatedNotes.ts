import type { Observable } from 'rxjs'
import { connect, ignoreElements, merge } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventMetadata } from '../types'
import { subscribeAuthorsFromNote } from './subscribeNoteAuthors'
import type { QuoteOptions } from './subscribeQuotes'
import { subscribeQuotes } from './subscribeQuotes'

type RelatedOptions = {
  quotes?: QuoteOptions
}

export function withRelatedNotes(ctx: NostrContext, options?: RelatedOptions) {
  return connect((event$: Observable<NostrEventMetadata>) => {
    return merge(
      event$,
      event$.pipe(subscribeAuthorsFromNote(ctx), ignoreElements()),
      event$.pipe(subscribeQuotes(ctx, options?.quotes), ignoreElements()),
    )
  })
}
