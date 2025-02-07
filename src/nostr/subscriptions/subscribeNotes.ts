import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import type { NostrEventNote } from '../types'
import { subscribe } from './subscribe'
import { subscribeParent } from './subscribeParent'
import { withRelatedNotes } from './withRelatedNotes'

export function subscribeNotes(filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) {
  return subscribe({ ...filter, kinds: [Kind.Text] }, client, options).pipe(ofKind<NostrEventNote>([Kind.Text]))
}

export function subscribeNotesWithRelated(filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) {
  return subscribeNotes(filter, client, options).pipe(withRelatedNotes(client))
}

export function subscribeNotesWithParent(filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) {
  return subscribeNotesWithRelated(filter, client, options).pipe(subscribeParent(client))
}
