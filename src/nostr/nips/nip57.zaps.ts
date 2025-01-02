import type { NostrFilter } from '@/core/types'
import { zapStore } from '@/stores/zaps/zaps.store'
import { Kind } from 'constants/kinds'
import { decode } from 'light-bolt11-decoder'
import type { NostrEvent } from 'nostr-tools'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { ZapMetadataDB } from 'nostr/types'
import { tap } from 'rxjs'
import { parseTags } from '../helpers/parseTags'
import { mapMetadata } from '../operators/mapMetadata'

const kinds = [Kind.Zap]

const BOLT11_KEYS = ['coin_network', 'amount', 'separator', 'timestamp', 'expiry', 'payment_hash', 'description']

export class NIP57Zaps {
  constructor(private client: NostrClient) {}

  decode(event: NostrEvent) {
    const { bolt11, ...tags } = parseTags(event.tags)
    const lnbc = bolt11?.[0][1]
    if (lnbc) {
      const decoded = decode(lnbc)
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
        tags,
      } as ZapMetadataDB
    }
    return {
      id: event.id,
      kind: event.kind,
    } as ZapMetadataDB
  }

  subscribe(filter: NostrFilter, options?: ClientSubOptions) {
    return this.client
      .subscribe({ kinds, ...filter }, { ...options, cacheFilter: { kinds, ...options?.cacheFilter } })
      .pipe(
        mapMetadata(this.decode),

        tap(([event, metadata]) => zapStore.add(event, metadata)),
      )
  }
}
