import { Kind } from '@/constants/kinds'
import type { NostrClient } from '../nostr'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeMutes(client: NostrClient, pubkey: string) {
  return client.subscribe({ kinds: [Kind.Mutelist], authors: [pubkey] }).pipe(withRelatedAuthors(client))
}
