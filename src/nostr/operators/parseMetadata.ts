import type { NostrEvent } from 'nostr-tools'
import { map } from 'rxjs'
import { metadataSymbol } from '../types'

export function parseMetadata<T>(parser: (event: NostrEvent) => T) {
  return map((event: NostrEvent) => {
    const newMetadata = parser(event)
    return { ...event, [metadataSymbol]: newMetadata }
  })
}
