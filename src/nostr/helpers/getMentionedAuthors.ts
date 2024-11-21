import { dedupe } from 'core/helpers'
import type { NEventAttributes, NProfileAttributes } from 'nostr-editor'
import type { ParsedTags } from '@/nostr/helpers/parseTags'

export function getMentionedAuthors(
  tags: ParsedTags,
  nprofiles: NProfileAttributes[] = [],
  nevents: NEventAttributes[] = [],
) {
  return dedupe(
    tags.p?.map((x) => x[1]),
    nprofiles.map((ref) => ref.pubkey),
    nevents.map((ref) => ref.author),
  )
}
