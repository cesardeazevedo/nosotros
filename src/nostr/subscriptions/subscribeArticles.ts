import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import type { NostrEventNote } from '../types'
import { subscribe } from './subscribe'

const kinds = [Kind.Article]

export function subscribeArticles(filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) {
  return subscribe({ kinds, ...filter }, client, options).pipe(ofKind<NostrEventNote>(kinds))
}
