import { dedupe } from 'core/helpers'
import type { NostrEvent, RelayHints } from 'core/types'
import type { EventReference, NostrReference } from 'nostr/nips/nip27.references'

const QUOTE = 'q'
const EVENT = 'e'
const PUBKEY = 'p'

export const isEventTag = (tag: string[]) => tag[0] === EVENT
export const isQuoteTag = (tag: string[]) => tag[0] === QUOTE
export const isAuthorTag = (tag: string[]) => tag[0] === PUBKEY

export const isMention = (tag: string[]) => tag[3] === 'mention'

export function getRelayHintsFromTags(event: NostrEvent) {
  const hints: Required<RelayHints> = { authors: {}, fallback: {}, ids: {} }
  for (const tag of event?.tags || []) {
    if (tag[2]) {
      const [, id, relay] = tag
      if (isAuthorTag(tag)) {
        hints.authors[id] = dedupe(hints.authors[id], [relay])
      } else if (isEventTag(tag) || isQuoteTag(tag)) {
        hints.ids[id] = dedupe(hints.ids[id], [relay])
      }
    }
  }
  return hints
}

export function getRelayHintsFromReferences(references: NostrReference[], mentionedAuthors: string[]) {
  const hints: Required<RelayHints> = { authors: {}, fallback: {}, ids: {} }
  for (const ref of references) {
    switch (ref.prefix) {
      case 'npub':
      case 'nprofile': {
        const { pubkey, relays } = ref.profile
        const list = dedupe(hints.authors[pubkey], relays)
        if (list.length > 0) {
          hints.authors[pubkey] ??= []
          hints.authors[pubkey] = list
        }
        break
      }
      case 'note':
      case 'nevent': {
        const { id, relays, author } = ref.event
        if (relays?.length !== 0) {
          hints.ids[id] = dedupe(hints.ids[id], relays)
        } else {
          // In case there's no relays hints for a nevent, we fallback to the event author and others mentioned authors
          hints.fallback[id] = dedupe(mentionedAuthors, [author])
        }
        break
      }
    }
  }
  return hints
}

export function getMentionedNotes(event: NostrEvent, references: NostrReference[]) {
  const tags = event.tags.filter((tag) => (isEventTag(tag) && isMention(tag)) || isQuoteTag(tag))
  const refs = references.filter((x): x is EventReference => x.prefix === 'nevent' || x.prefix === 'note')
  return dedupe(
    tags.map((x) => x[1]),
    refs.map((ref) => ref.event.id),
  )
}

export function getMentionedAuthors(event: NostrEvent, references: NostrReference[], authorsTags: string[][]) {
  return dedupe(
    [event.pubkey],
    authorsTags.map((x) => x[1]),
    references.map((ref) => ref.author),
  )
}
