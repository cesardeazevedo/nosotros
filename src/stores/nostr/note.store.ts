import { Kind } from 'constants/kinds'
import { makeAutoObservable } from 'mobx'
import { Event } from 'nostr-tools'
import { ObservableDB } from 'stores/db/observabledb.store'
import { ParsedContent, TokenType, parseContent, parseMarkdown } from 'utils/contentParser'
import type { RootStore } from '../root.store'

type ContentSchema = {
  id: string
  hasMedia?: boolean
  content?: ParsedContent
  html?: string
}

export class NoteStore {
  ids = new Set<string>()

  // @ts-ignore
  notes = new ObservableDB<Event>('notes', { indexes: ['created_at', 'pubkey'] })
  content = new ObservableDB<ContentSchema>('notes-parsed')

  constructor(private root?: RootStore) {
    makeAutoObservable(this)

    this.notes.keys().then((keys) => {
      this.ids = keys as Set<string>
    })
  }

  getNoteById(id: string): Event | undefined {
    return this.notes.get(id)
  }

  getParsedContentById(id: string): ContentSchema | undefined {
    return this.content.get(id)
  }

  async add(event: Event) {
    this.ids.add(event.id)
    const note = await this.notes.fetch(event.id)
    if (!note) {
      this.notes.set(event.id, event)
    }

    const content = await this.content.fetch(event.id)
    if (!content && event.kind === Kind.Text) {
      const content = parseContent(event)
      const hasMedia = content.some((x) => x.kind === TokenType.IMAGE || x.kind === TokenType.VIDEO)
      this.content.set(event.id, { id: event.id, hasMedia, content: parseContent(event) })
    } else if (event.kind === Kind.Article) {
      this.content.set(event.id, { id: event.id, content: parseMarkdown(event) })
    }
  }

  clear() {
    this.notes.clear()
    this.content.clear()
  }
}
