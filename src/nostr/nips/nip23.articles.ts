import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import type { NostrEventNote } from '../types'

const kinds = [Kind.Article]

export class NIP23Articles {
  constructor(private client: NostrClient) {}

  subscribe(filter: NostrFilter, options?: ClientSubOptions) {
    return this.client.subscribe({ kinds, ...filter }, options).pipe(ofKind<NostrEventNote>(kinds))
  }
}
