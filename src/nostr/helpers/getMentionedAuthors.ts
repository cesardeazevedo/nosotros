import { dedupe } from 'core/helpers'
import type { NostrEvent } from 'nostr-tools'
import { isAuthorTag } from 'nostr/helpers/tags'
import type { NostrReference } from 'nostr/nips/nip27.references'

export function getMentionedAuthors(event: NostrEvent, references: NostrReference[]) {
  const authorsTags = event.tags.filter((tag) => isAuthorTag(tag))
  return dedupe(
    [event.pubkey],
    authorsTags.map((x) => x[1]),
    references.map((ref) => ref.author),
  )
}
