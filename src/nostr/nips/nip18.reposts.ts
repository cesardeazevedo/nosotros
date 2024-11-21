import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { Note } from '@/stores/models/note'
import { Repost } from '@/stores/models/repost'
import { noteStore } from '@/stores/nostr/notes.store'
import { repostStore } from '@/stores/nostr/reposts.store'
import type { NostrEvent } from 'nostr-tools'
import { filter, ignoreElements, map, merge, mergeMap } from 'rxjs'
import { parseTags } from '../helpers/parseTags'
import type { NostrClient, ClientSubOptions } from '../nostr'
import { mapMetadata } from '../operators/mapMetadata'
import type { RepostDB } from '../types'

export class NIP18Reposts {
  constructor(private client: NostrClient) {}

  parse(event: NostrEvent) {
    const { hints = {}, ...tags } = parseTags(event.tags)
    return {
      id: event.id,
      kind: event.kind,
      tags,
      relayHints: hints,
      mentionedNotes: tags.e.map((x) => x[1]),
    } satisfies RepostDB
  }

  subFromNote(note: Note, options?: ClientSubOptions) {
    return this.subscribe({ '#e': [note.id] }, options)
  }

  subscribe(filters: NostrFilter, options?: ClientSubOptions) {
    return this.client.subscribe({ ...filters, kinds: [Kind.Repost] }, options).pipe(
      mapMetadata(this.parse),

      mergeMap(([event, metadata]) => {
        const relayHints = metadata.relayHints
        const id = metadata.mentionedNotes[0]
        return merge(
          // get repost author
          this.client.users.subscribe(event.pubkey).pipe(ignoreElements()),
          // get inner note
          this.client.notes.subWithRelated({ ids: [id] }, { relayHints }).pipe(
            filter((note) => note.id === id),
            map((note) => new Repost(event, metadata, note)),
          ),
        )
      }),

      map((repost) => {
        noteStore.add(repost.note)
        repostStore.add(repost)
        return repost
      }),
    )
  }
}
