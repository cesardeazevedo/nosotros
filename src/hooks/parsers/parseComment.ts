import type { NostrEvent } from 'nostr-tools'
import type { Metadata } from '../../nostr/types'
import { parseContent } from './parseContent'
import { parseRelayHintsFromTags } from './parseRelayHints'

export function parseComment(event: NostrEvent): Metadata {
  const content = parseContent(event)
  const relayHints = parseRelayHintsFromTags(event)
  const E = event.tags.find((x) => x[0] === 'E')
  const A = event.tags.find((x) => x[0] === 'A')
  const I = event.tags.find((x) => x[0] === 'I')

  const rootTag = E ? 'E' : A ? 'A' : I ? 'I' : ''

  const rootId = event.tags.find((tag) => tag[0] === rootTag)?.[1]
  const parentId = event.tags.find((tag) => tag[0] === rootTag.toLowerCase())?.[1]

  return {
    ...content,
    isRoot: false,
    rootId,
    parentId,
    relayHints,
  }
}
