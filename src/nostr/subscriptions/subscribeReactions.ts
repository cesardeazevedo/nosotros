import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'

const kinds = [Kind.Reaction]

export function subscribeReactions(filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) {
  return client.subscribe({ ...filter, kinds }, options)
}
