import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { subscribe } from './subscribe'

const kinds = [Kind.Reaction]

export function subscribeReactions(filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) {
  return subscribe({ ...filter, kinds }, client, options)
}
