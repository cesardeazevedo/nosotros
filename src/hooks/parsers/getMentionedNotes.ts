import { dedupe } from '@/core/helpers/dedupe'
import type { NAddrAttributes, NEventAttributes } from 'nostr-editor'
import { isEventTag, isMention, isQuoteTag } from './parseTags'

export function getMentionedNotes(tags: string[][], nevents: NEventAttributes[], naddress: NAddrAttributes[]) {
  return dedupe(
    tags
      .filter(isEventTag)
      .filter(isMention)
      .map((x) => x[1]),
    tags.filter(isQuoteTag).map((x) => x[1]),
    nevents.map((attr) => attr.id),
    naddress.map((attr) => `${attr.kind}:${attr.pubkey}:${attr.identifier}`),
  )
}
