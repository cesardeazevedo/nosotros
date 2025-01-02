import { Kind } from '@/constants/kinds'
import { parseNote } from '@/nostr/nips/nip01/metadata/parseNote'
import type { ClientSubOptions, NostrClient } from '@/nostr/nostr'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { connect, filter, ignoreElements, map, merge, mergeMap, of, tap } from 'rxjs'
import { BaseModuleModel } from '../modules/module'
import { Note } from '../notes/note'
import type { Repost } from '../reposts/repost'

export type NEventOptions = {
  id: string
  kind?: number
  author?: string
  relays?: string[]
}

export const NEventModuleModel = BaseModuleModel.named('NEventModule')
  .props({
    type: t.optional(t.literal('nevent'), 'nevent'),
    options: t.frozen<NEventOptions>(),
  })
  .volatile(() => ({
    note: null as Note | Repost | null,
  }))
  .actions((self) => ({
    setNote(note: Note | Repost) {
      self.note = note
    },
  }))
  .actions((self) => ({
    start(client: NostrClient) {
      const { kind, id, relays } = self.options
      const options = { relayHints: { ids: { [id]: relays } } } as ClientSubOptions
      // If we know the kind, use some of the existing pipelines
      return of(kind).pipe(
        mergeMap((kind) => {
          switch (kind) {
            case Kind.Text:
            case Kind.Article: {
              return client.notes.subWithRelated({ kinds: [kind], ids: [id] }, options).pipe(filter((x) => x.id === id))
            }
            case Kind.Repost: {
              return client.reposts.subscribe({ kinds: [kind], ids: [id] }, options)
            }
            default: {
              // Unknown kind
              return client.subscribe({ ids: [id] }, options).pipe(
                mergeMap((event) => {
                  // Start related subscriptions based on the event kind
                  switch (event.kind) {
                    case Kind.Text:
                    case Kind.Article: {
                      return of(event).pipe(
                        client.notes.process(),
                        connect((shared) => {
                          return merge(
                            shared,
                            shared.pipe(
                              mergeMap((note) => client.notes.subRelated(note, options)),
                              ignoreElements(),
                            ),
                          )
                        }),
                      )
                    }
                    case Kind.Repost: {
                      return of(event).pipe(client.reposts.process())
                    }
                    default: {
                      // Create a generic event from a kinda we don't really know
                      return of(event).pipe(
                        connect((shared) => {
                          return merge(
                            shared,
                            shared.pipe(
                              mergeMap(() => client.users.subscribe(event.pubkey)),
                              ignoreElements(),
                            ),
                          )
                        }),
                        map(() => {
                          // Generic event, parse as note for now, ideally we want a generic event model.
                          return new Note(event, parseNote(event))
                        }),
                      )
                    }
                  }
                }),
              )
            }
          }
        }),
        tap((note) => {
          self.setNote(note)
          if (note instanceof Note) {
            note.toggleReplies(true)
          }
        }),
      )
    },
  }))

export interface NEventModule extends Instance<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotIn extends SnapshotIn<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotOut extends SnapshotOut<typeof NEventModuleModel> {}
