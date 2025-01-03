import { dedupe } from '@/core/helpers/dedupe'
import type { ParsedTags } from '@/nostr/helpers/parseTags'
import type { NEventAttributes, NProfileAttributes } from 'nostr-editor'

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
