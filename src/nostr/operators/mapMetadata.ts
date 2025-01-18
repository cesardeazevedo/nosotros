import type { MetadataDB } from '@/db/types'
import type { NostrEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { from, map, mergeMap } from 'rxjs'
import { db } from '../db'
import type { MetadataSymbol } from '../types'
import { metadataSymbol } from '../types'

export function persistMetadata<T extends MetadataDB>(
  parser: (event: NostrEvent) => T,
): OperatorFunction<NostrEvent, NostrEvent & MetadataSymbol<T>> {
  return mergeMap((event: NostrEvent) => {
    return from(db.metadata.query<T>(event.id)).pipe(
      map((metadata) => {
        if (metadata) {
          return { ...event, [metadataSymbol]: metadata }
        }
        const newMetadata = parser(event)
        db.metadata.insert(newMetadata)
        return { ...event, [metadataSymbol]: newMetadata }
      }),
    )
  })
}

export function mergeMetadata<T>(parser: (event: NostrEvent) => T) {
  return map((event: NostrEvent) => {
    const newMetadata = parser(event)
    return { ...event, [metadataSymbol]: newMetadata }
  })
}
