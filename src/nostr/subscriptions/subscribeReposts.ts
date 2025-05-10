import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'
import { validateEvent } from 'nostr-tools'
import { defaultIfEmpty, EMPTY, filter, map, mergeMap, of, tap } from 'rxjs'
import type { NostrContext } from '../context'
import { insert } from '../operators/insert'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { verifyWorker } from '../operators/verifyWorker'
import type { NostrEventMetadata } from '../types'
import { metadataSymbol, WRITE } from '../types'
import { subscribe } from './subscribe'
import { subscribeMediaStats } from './subscribeMediaStats'
import { subscribeNotesWithRelated } from './subscribeNotes'
import { withRelatedAuthors } from './withRelatedAuthor'
import { withRelatedNotes } from './withRelatedNotes'

const kinds = [Kind.Repost]

export function withRepostedEvent(ctx: NostrContext) {
  return mergeMap((event: NostrEventMetadata) => {
    try {
      const contentEvent = JSON.parse(event.content || '{}')
      return of(contentEvent).pipe(
        filter((event) => validateEvent(event)),
        verifyWorker(),
        insert(ctx),
        parseEventMetadata(),
        subscribeMediaStats(),
        withRelatedNotes(ctx),
        tap((event) => addNostrEventToStore(event)),
        defaultIfEmpty(null),
        mergeMap((value) => {
          if (!value) {
            // event content was empty, try to get the event by tags
            const metadata = event[metadataSymbol]
            const relayHints = metadata.relayHints
            const id = metadata.mentionedNotes?.[0]
            const author = metadata.tags?.p?.[0][1]
            if (id) {
              const relatedCtx = {
                ...ctx,
                pubkey: author,
                queryDB: true,
                permission: WRITE,
                relayHints,
                prune: false,
              } satisfies NostrContext
              // get inner note
              return subscribeNotesWithRelated({ ids: [id] }, relatedCtx).pipe(
                filter((event) => event.id === id),
                map(() => event),
              )
            }
          }
          return of(event)
        }),
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return EMPTY
    }
  })
}

export function subscribeReposts(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ ...filter, kinds }, ctx).pipe(
    withRelatedAuthors(ctx),
    // Only return reposts after getting the actual reposted event
    withRepostedEvent(ctx),
  )
}
