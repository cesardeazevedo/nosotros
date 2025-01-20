import { Kind } from '@/constants/kinds'
import type { NostrClient } from '../nostr'
import { withRelatedAuthors } from '../operators/withAuthor'

export function subscribeMutes(client: NostrClient, pubkey: string) {
  return client.subscribe({ kinds: [Kind.Mutelist], authors: [pubkey] }).pipe(withRelatedAuthors(client))
}
