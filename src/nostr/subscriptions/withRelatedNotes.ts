import { connect, ignoreElements, merge } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { subscribeAuthorsFromNote } from './subscribeNoteAuthors'
import type { QuoteOptions } from './subscribeQuotes'
import { subscribeQuotes } from './subscribeQuotes'
import type { Note$ } from './subscribeThreads'

type RelatedOptions = ClientSubOptions & {
  quotes?: QuoteOptions
}

export function withRelatedNotes(client: NostrClient, options?: RelatedOptions) {
  return connect((event$: Note$) => {
    return merge(
      event$,
      event$.pipe(subscribeAuthorsFromNote(client), ignoreElements()),
      event$.pipe(subscribeQuotes(client, options?.quotes), ignoreElements()),
    )
  })
}
