import { Kind } from '@/constants/kinds'
import type { ClientSubOptions } from '@/nostr/nostr'
import { rootStore } from '@/stores/root.store'
import type { NostrFilter } from 'core/types'
import { makeAutoObservable } from 'mobx'
import type { EventPointer } from 'nostr-tools/lib/types/nip19'
import { filter, mergeMap, tap } from 'rxjs'
import type { Note } from 'stores/models/note'
import { noteStore } from 'stores/nostr/notes.store'
import type { Repost } from '../models/repost'
import type { NostrContext } from '../ui/nostr.context'
import type { ModuleInterface } from './interface'

export type NoteOptions = {
  id?: string
  type?: 'note'
  data: EventPointer
  subscription?: ClientSubOptions
  context?: NostrContext
}

export class NoteModule implements ModuleInterface {
  id: string

  context: NostrContext

  note: Note | Repost | undefined

  filter: NostrFilter
  options: NoteOptions

  constructor(options: NoteOptions) {
    const { data } = options

    this.id = options.id || Math.random().toString().slice(2, 10)

    this.context = options.context || rootStore.rootContext

    this.options = {
      ...options,
      type: 'note',
      id: this.id,
      subscription: {
        relayHints: {
          ids: { [data.id]: data.relays || [] },
        },
      },
    }

    this.note = noteStore.get(data.id)

    this.filter = { ids: [data.id] }
    if (data.kind !== undefined) {
      this.filter.kinds = [data.kind]
    }

    makeAutoObservable(this, {
      filter: false,
    })
  }

  private addNote(note: Note | Repost) {
    this.note = note
  }

  start() {
    // some kinds need different subscriptions
    switch (this.filter.kinds?.[0]) {
      case Kind.Repost: {
        return this.subReposts()
      }
      default: {
        return this.subNotes()
      }
    }
  }

  private subReposts() {
    return this.context.client.reposts.subscribe(this.filter, this.options.subscription).pipe(
      filter((x) => x.id === this.options.data.id),
      tap((repost) => {
        this.addNote(repost)
        repost.note.toggleReplies()
      }),
      mergeMap((repost) => repost.note.subscribe(this.context.client)),
    )
  }

  private subNotes() {
    return this.context.client.notes.subWithRelated(this.filter, this.options.subscription).pipe(
      filter((x) => x.id === this.options.data.id),
      tap((note) => {
        this.addNote(note)
        note.toggleReplies(true)
      }),
      mergeMap((note) => note.subscribe(this.context.client)),
    )
  }
}
