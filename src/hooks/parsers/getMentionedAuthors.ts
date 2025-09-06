import { dedupe } from '@/core/helpers/dedupe'
import type { NAddrAttributes, NEventAttributes, NProfileAttributes } from 'nostr-editor'
import { isAuthorTag } from './parseTags'

export function getMentionedAuthors(
  tags: string[][],
  nprofiles: NProfileAttributes[],
  nevents: NEventAttributes[],
  naddress: NAddrAttributes[],
) {
  return dedupe(
    tags.filter(isAuthorTag).map((x) => x[1]),
    nprofiles.map((ref) => ref.pubkey),
    nevents.map((ref) => ref.author),
    naddress.map((ref) => ref.pubkey),
  )
}
