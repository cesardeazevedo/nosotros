import type { NostrEvent } from 'nostr-tools'
import type { Metadata } from '../../nostr/types'
import { parseRelayHintsFromTags } from './parseRelayHints'
import { isAddressTag, isAuthorTag, isEventTag, isMention } from './parseTags'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'

// These are NIP-10 reply marks
export function parseReplies(event: NostrEvent): Metadata {
  const relayHints = parseRelayHintsFromTags(event)
  const repliesTags = [
    ...(event.tags.filter(isEventTag).filter((tag) => !isMention(tag)) || []),
    ...(event.tags.filter(isAddressTag).filter((tag) => !isMention(tag)) || []),
  ]
  const rootId = repliesTags.find((x) => x[3] === 'root')?.[1]
  const parentId = repliesTags.find((x) => x[3] === 'reply')?.[1] || rootId

  const pTags = event.tags.filter(isAuthorTag).map((tag) => tag[1])
  const parentHints = parentId ? { idHints: { [parentId]: [event.pubkey, ...pTags] } } : {}
  const rootHints = rootId ? { idHints: { [rootId]: [event.pubkey, ...pTags] } } : {}

  const isRoot = !rootId && !parentId
  return {
    isRoot,
    rootId,
    parentId,
    relayHints: mergeRelayHints([relayHints, parentHints, rootHints]),
  }
}
