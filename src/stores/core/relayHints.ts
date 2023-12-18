import { Note } from 'stores/modules/note.store'
import { dedupe, groupKeysToArray, isAuthorTag, isEventTag, isQuoteTag, removeEmptyKeys } from 'utils/utils'

type Records = Record<string, string[]>

export type RelayHintsData = {
  authors?: Records
  ids?: Records
  // We might not be able to find relays for certain event ids,
  // so we need to fallback to the author or multiple possible authors.
  fallback?: Records
}

export class RelayHints {
  note: Note
  hints: RelayHintsData

  constructor(note: Note, hints?: RelayHintsData) {
    this.note = note
    this.hints = hints || {}
  }

  static merge(hints: RelayHintsData[]) {
    const authors = groupKeysToArray(hints.map((x) => x.authors)) as RelayHintsData['authors']
    const ids = groupKeysToArray(hints.map((x) => x.ids)) as RelayHintsData['ids']
    const fallback = groupKeysToArray(hints.map((x) => x.fallback)) as RelayHintsData['fallback']
    return removeEmptyKeys<RelayHintsData>({ authors, ids, fallback })
  }

  parse() {
    this.setRelaysFromTags()
    this.setRelaysFromNoteSeenOn()
    this.setRelayFromContentParsed()
    return this.hints
  }

  private set(key: keyof RelayHintsData, id: string, relays: string[]) {
    this.hints[key] ??= {}
    const field = this.hints[key] as Records
    field[id] = dedupe(field[id], relays)
  }

  private setRelaysFromNoteSeenOn() {
    const relays = this.note.seenOn || []
    if (relays.length > 0) {
      this.set('authors', this.note.event.pubkey, relays)
    }
  }

  private setRelaysFromTags() {
    for (const tag of this.note.content?.event?.tags || []) {
      if (tag[2]) {
        const [, id, relay] = tag
        if (isAuthorTag(tag)) {
          this.set('authors', id, [relay])
        } else if (isEventTag(tag) || isQuoteTag(tag)) {
          this.set('ids', id, [relay])
        }
      }
    }
  }

  private setRelayFromContentParsed() {
    for (const { profile, event } of this.note.content.references) {
      if (profile) {
        this.set('authors', profile.pubkey, profile.relays || [])
      } else if (event) {
        if (event.relays?.length !== 0) {
          this.set('ids', event.id, event.relays || [])
        } else {
          // In case there's no relays hints for a nevent, we fallback to the event author and others mentioned authors
          this.set('fallback', event.id, dedupe(this.note.mentionedAuthors, [event.author]))
        }
      }
    }
  }
}
