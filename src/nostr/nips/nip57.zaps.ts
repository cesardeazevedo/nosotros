import type { NostrFilter } from '@/core/types'
import { zapStore } from '@/stores/zaps/zaps.store'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { tap } from 'rxjs'
import { parseZapEvent } from '../helpers/parseZap'
import { mapMetadata } from '../operators/mapMetadata'

const kinds = [Kind.Zap]

export class NIP57Zaps {
  constructor(private client: NostrClient) {}

  subscribe(filter: NostrFilter, options?: ClientSubOptions) {
    return this.client
      .subscribe({ kinds, ...filter }, { ...options, cacheFilter: { kinds, ...options?.cacheFilter } })
      .pipe(
        mapMetadata(parseZapEvent),
        tap(([event, metadata]) => zapStore.add(event, metadata)),
      )
  }
}
