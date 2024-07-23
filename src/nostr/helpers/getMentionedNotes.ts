import { dedupe } from 'core/helpers'
import type { NostrEvent } from 'nostr-tools'
import { isEventTag, isMention, isQuoteTag } from 'nostr/helpers/tags'
import type { EventReference, NostrReference } from 'nostr/nips/nip27.references'

export function getMentionedNotes(event: NostrEvent, references: NostrReference[]) {
  const tags = event.tags.filter((tag) => (isEventTag(tag) && isMention(tag)) || isQuoteTag(tag))
  const refs = references.filter((x): x is EventReference => x.prefix === 'nevent' || x.prefix === 'note')
  return dedupe(
    tags.map((x) => x[1]),
    refs.map((ref) => ref.event.id),
  )
}
