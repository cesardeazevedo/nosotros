import { dedupe } from '@/core/helpers/dedupe'
import type { ParsedTags } from '@/nostr/helpers/parseTags'
import { isMention } from '@/nostr/helpers/parseTags'
import type { NAddrAttributes, NEventAttributes } from 'nostr-editor'

export function getMentionedNotes(tags: ParsedTags, nevents: NEventAttributes[], naddress: NAddrAttributes[]) {
  return dedupe(
    tags.e?.filter(isMention).map((x) => x[1]),
    tags.q?.map((x) => x[1]),
    nevents.map((attr) => attr.id),
    naddress.map((attr) => `${attr.kind}:${attr.pubkey}:${attr.identifier}`),
  )
}
