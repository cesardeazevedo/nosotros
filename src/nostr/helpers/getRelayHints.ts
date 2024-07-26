import { dedupe } from 'core/helpers'
import { mergeRelayHints } from 'core/mergers/mergeRelayHints'
import type { RelayHints } from 'core/types'
import type { NostrEvent } from 'nostr-tools'
import { isAuthorTag, isEventTag, isQuoteTag } from 'nostr/helpers/tags'
import type { NostrReference } from 'nostr/nips/nip27.references'

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

export function getRelayHints(event: NostrEvent, references: NostrReference[], mentionedAuthors: string[]) {
  const hintTags = getRelayHintsFromTags(event)
  const hintRefs = getRelayHintsFromReferences(references, mentionedAuthors)
  return mergeRelayHints([hintTags, hintRefs])
}
