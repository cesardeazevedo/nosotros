import { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { ParsedTags } from './parseTags'
import { parseTags } from './parseTags'
import type { MetadataDB } from '@/db/types'

export interface RelayDiscoveryMetadata extends MetadataDB {
  kind: Kind.RelayDiscovery
  tags: ParsedTags
}

export function parseRelayDiscovery(event: NostrEvent): RelayDiscoveryMetadata {
  return {
    id: event.id,
    kind: Kind.RelayDiscovery,
    tags: parseTags(event.tags),
  }
}
