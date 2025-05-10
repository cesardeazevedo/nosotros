import type { NostrEvent } from 'nostr-tools'
import { map } from 'rxjs'
import type { Metadata, NostrEventMetadata } from '../types'
import { metadataSymbol } from '../types'

export function parseMetadata(parser: (event: NostrEvent) => Metadata) {
  return map((event: NostrEvent) => {
    const newMetadata = parser(event)
    return { ...event, [metadataSymbol]: newMetadata } as NostrEventMetadata
  })
}
