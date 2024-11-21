import { dedupe } from 'core/helpers'
import type { NEventAttributes } from 'nostr-editor'
import type { ParsedTags } from '@/nostr/helpers/parseTags'
import { isMention } from '@/nostr/helpers/parseTags'

export function getMentionedNotes(tags: ParsedTags, nevents: NEventAttributes[] = []) {
  return dedupe(
    tags.e?.filter(isMention).map((x) => x[1]),
    tags.q?.map((x) => x[1]),
    nevents.map((attr) => attr.id),
  )
}
