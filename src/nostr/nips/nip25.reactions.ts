import type { NostrFilter } from '@/core/types'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'

const kinds = [Kind.Reaction]

export class NIP25Reactions {
  constructor(private client: NostrClient) {}

  subscribe(filter: NostrFilter, options?: ClientSubOptions) {
    return this.client.subscribe({ ...filter, kinds }, options)
  }
}
