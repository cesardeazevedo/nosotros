import type { NostrFilter } from '@/core/types'
import type { Note } from '@/stores/models/note'
import { zapStore } from '@/stores/nostr/zaps.store'
import { Kind } from 'constants/kinds'
import { decode } from 'light-bolt11-decoder'
import type { NostrEvent } from 'nostr-tools'
import type { NostrClient, ClientSubOptions } from 'nostr/nostr'
import type { ZapMetadataDB } from 'nostr/types'
import { EMPTY, tap } from 'rxjs'
import { mapMetadata } from '../operators/mapMetadata'

const kinds = [Kind.Zap]

const BOLT11_KEYS = ['coin_network', 'amount', 'separator', 'timestamp', 'expiry', 'payment_hash', 'description']

export class NIP57Zaps {
  constructor(private client: NostrClient) {}

  decode(event: NostrEvent) {
    const bolt11 = event.tags.find((tag) => tag[0] === 'bolt11')?.[1]
    if (bolt11) {
      const decoded = decode(bolt11)
      const data = decoded.sections.reduce(
        (acc, x) => {
          if (BOLT11_KEYS.includes(x.name)) {
            acc[x.name as keyof ZapMetadataDB['bolt11']] = {
              letters: x.letters,
              value: x.value as never,
            }
          }
          return acc
        },
        {} as ZapMetadataDB['bolt11'],
      )
      return {
        id: event.id,
        kind: event.kind,
        bolt11: data,
      } as ZapMetadataDB
    }
    return {
      id: event.id,
      kind: event.kind,
    } as ZapMetadataDB
  }

  subFromNote(note: Note, options?: ClientSubOptions) {
    const ids = [note.id, ...note.meta.mentionedNotes]
    const filter: NostrFilter = { kinds, '#e': ids }
    return this.subscribe(
      { ...filter, since: note.meta.lastSyncedAt },
      {
        ...options,
        cacheFilter: filter,
      },
    )
  }

  subscribe(filter: NostrFilter, options?: ClientSubOptions) {
    if (this.client.settings.nip57enabled) {
      return this.client.subscribe({ kinds, ...filter }, options).pipe(
        mapMetadata(this.decode),

        tap(([event, metadata]) => zapStore.add(event, metadata)),
      )
    }
    return EMPTY
  }
}
