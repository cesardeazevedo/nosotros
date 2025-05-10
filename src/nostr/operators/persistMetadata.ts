import type { NostrEvent } from 'nostr-tools'
import { type OperatorFunction, from, map, mergeMap } from 'rxjs'
import { db } from '../db'
import type { Metadata, NostrEventMetadata } from '../types'
import { metadataSymbol } from '../types'

export function persistMetadata(
  parser: (event: NostrEvent) => Metadata,
): OperatorFunction<NostrEvent, NostrEventMetadata> {
  return mergeMap((event: NostrEvent) => {
    return from(db.metadata.query(event.id)).pipe(
      map((metadata) => {
        if (metadata) {
          return { ...event, [metadataSymbol]: metadata } as NostrEventMetadata
        }
        const newMetadata = parser(event)
        db.metadata.insert({
          id: event.id,
          kind: event.kind,
          ...newMetadata,
        })
        return { ...event, [metadataSymbol]: newMetadata } as NostrEventMetadata
      }),
    )
  })
}
