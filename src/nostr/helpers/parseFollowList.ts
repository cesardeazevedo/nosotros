import type { Kind } from '@/constants/kinds'
import type { MetadataDB } from '@/db/types'
import type { NostrEvent } from 'nostr-tools'

export type FollowsMetadata = MetadataDB & {
  kind: Kind.Follows
  tags: Map<string, Set<string>>
}

export function parseFollowList(event: NostrEvent): FollowsMetadata {
  const tags = event.tags.reduce((acc, tag) => {
    // Removes invalid data from tags
    if (!((tag[0] === 'p' && tag[1].length === 64) || import.meta.env.MODE === 'test')) {
      return acc
    }
    const found = acc.get(tag[0])
    if (!found) {
      acc.set(tag[0], new Set([tag[1]]))
    } else {
      found.add(tag[1])
    }
    return acc
  }, new Map<string, Set<string>>())

  return {
    id: event.id,
    kind: event.kind,
    tags,
  }
}
