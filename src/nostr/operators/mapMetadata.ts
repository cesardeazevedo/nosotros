import type { MetadataDB } from '@/db/types'
import type { NostrEvent } from 'nostr-tools'
import { from, map, mergeMap } from 'rxjs'
import { db } from '../db'

export function mapMetadata<T extends MetadataDB>(parser: (event: NostrEvent) => T | undefined) {
  return mergeMap((event: NostrEvent) => {
    return from(db.metadata.query<T>(event.id)).pipe(
      map((metadata) => {
        if (metadata) {
          return [event, metadata] as [NostrEvent, T]
        }
        const newMetadata = parser(event)
        if (newMetadata) {
          db.metadata.insert(newMetadata)
        }
        return [event, newMetadata] as [NostrEvent, T]
      }),
    )
  })
}
