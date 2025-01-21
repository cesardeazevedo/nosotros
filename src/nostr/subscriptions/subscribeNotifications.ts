import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import { connect, EMPTY, from, ignoreElements, merge, mergeMap } from 'rxjs'
import { isEventTag } from '../helpers/parseTags'
import type { NostrClient } from '../nostr'
import type { NostrEventMetadata } from '../types'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeNotifications(client: NostrClient, pagination: PaginationSubject) {
  return pagination.pipe(
    mergeMap((filter) => {
      return from(filter.kinds || []).pipe(
        mergeMap((kind) => {
          switch (kind) {
            case Kind.Text: {
              return client.notes.subNotesWithRelated({ ...filter, kinds: [Kind.Text] })
            }
            case Kind.Reaction: {
              return client.reactions.subscribe(filter).pipe(
                connect((shared$) => {
                  return merge(
                    shared$,
                    shared$.pipe(
                      mergeMap((event) => {
                        return merge(
                          // get reacted note
                          client.notes.subNotesWithRelated({
                            ids: event.tags.filter(isEventTag).flatMap((x) => x[1]),
                          }),
                          // get author of reaction
                          client.users.subscribe(event.pubkey),
                        )
                      }),
                      ignoreElements(),
                    ),
                  )
                }),
              )
            }
            case Kind.Repost: {
              return client.reposts.subscribeWithRepostedEvent(filter)
            }
            case Kind.ZapReceipt: {
              return client.zaps.subscribe(filter).pipe(
                withRelatedAuthors(client),
                ofKind<NostrEventMetadata>([Kind.ZapReceipt]), // cast
              )
            }
            default: {
              return EMPTY
            }
          }
        }),
      )
    }),
  )
}
