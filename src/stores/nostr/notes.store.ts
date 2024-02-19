import { Duration } from 'luxon'
import { makeAutoObservable } from 'mobx'
import type { Event } from 'nostr-tools'
import { map, mergeMap, of, pipe, share, tap } from 'rxjs'
import { Filter } from 'stores/core/filter'
import { bufferTime, mergeStream } from 'stores/core/operators'
import type { SubscriptionOptions } from 'stores/core/subscription'
import { ObservableDB } from 'stores/db/observabledb.store'
import { Note, type EventDB } from 'stores/modules/note.store'
import { dedupe } from 'utils/utils'
import type { RootStore } from '../root.store'

export type ReplyDB = {
  id: string
  replies: string[]
}

export class NotesStore {
  notes = new ObservableDB<EventDB, Note>('notes2', {
    indexes: ['createdAt', 'pubkey', 'hasMedia'],
    expireTime: Duration.fromObject({ hours: 24 }).toMillis(),
    serialize: (note) => note.serialize(),
    deserialize: (event) => Note.deserialize(this.root, event),
  })

  replies = new ObservableDB<ReplyDB>('replies', {
    expireTime: Duration.fromObject({ hours: 24 }).toMillis(),
  })

  posts$ = pipe(
    bufferTime(1000),
    mergeMap<Event[], Promise<Note[]>>((events) => this.loadNotes(events)),
    map((notes) => [...notes].sort((a, b) => b.event.created_at - a.event.created_at)),
    tap((notes) => this.subUsersFromNotes(notes)),
  )

  constructor(private root: RootStore) {
    makeAutoObservable(this)
  }

  getNoteById(id: string | undefined) {
    return this.notes.get(id)
  }

  async load(event: Event) {
    const note = await this.notes.fetch(event.id)
    if (!note && event) {
      const note = new Note(this.root, event)
      this.add(note)
      await this.addReply(note)
      return note
    }
    return note || new Note(this.root, event)
  }

  async loadNotes(events: Event[]) {
    const notes = []
    for (const event of events) {
      notes.push(await this.load(event))
    }
    return notes
  }

  add(note: Note) {
    if (!this.notes.cachedKeys.has(note.id)) {
      this.notes.set(note.id, note)
    }
  }

  async addReply(note: Note) {
    const id = note.parentNoteId
    if (id && !note.isRoot) {
      const replies = (await this.replies.fetch(id))?.replies || []
      this.replies.set(id, { id, replies: dedupe(replies, [note.id]) })
    }
  }

  subUsersFromNotes(notes: Note[]) {
    const relayHints = Note.mergeRelayHints(notes)
    const authors = notes.map((note) => note.mentionedAuthors)
    this.root.users.subscribe(dedupe(authors), { relayHints })
  }

  /**
   * Subscribe to parent and mentioned notes
   */
  subNotesRelated(notes: Note[]) {
    const rootNotes = notes.filter((x) => !x.isRoot && !x.isReplyOfAReply).map((x) => x.rootNoteId)
    const mentionNotes = notes.map((x) => x.mentionedNotes)
    const relayHints = Note.mergeRelayHints(notes)
    const ids = dedupe(rootNotes, mentionNotes)

    if (ids.length > 0) {
      const filter = new Filter(this.root, { ids })
      const sub = this.root.nostr.subscribe(filter, { relayHints }).onEvent$.pipe(this.posts$, share())
      sub.subscribe()
      return sub
    }
    return of([])
  }

  subNotesByIds(ids: string[], options?: SubscriptionOptions) {
    const filter = new Filter(this.root, { ids })
    return this.subscribe(filter, options)
  }

  subscribe(filter: Filter, options?: SubscriptionOptions) {
    const sub = this.root.nostr.subscribe(filter, options)
    const stream$ = sub.onEvent$.pipe(
      this.posts$,
      // Get related notes in the same stream
      mergeStream((notes) => {
        return this.subNotesRelated(notes).pipe(
          // Related notes might have related notes
          mergeStream((notes) => this.subNotesRelated(notes)),
        )
      }),
      share(),
    )
    stream$.subscribe()
    return stream$
  }
}
