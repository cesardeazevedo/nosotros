import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import type { NostrEventMedia } from '../types'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeMedia(client: NostrClient, filter: NostrFilter, options?: ClientSubOptions) {
  return client.subscribe(filter, options).pipe(ofKind<NostrEventMedia>([Kind.Media]), withRelatedAuthors(client))
}
