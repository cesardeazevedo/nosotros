import { Kind } from '@/constants/kinds'
import type { NostrClient } from '../nostr'
import { subscribe } from './subscribe'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeMutes(client: NostrClient, pubkey: string) {
  return subscribe({ kinds: [Kind.Mutelist], authors: [pubkey] }, client).pipe(withRelatedAuthors(client))
}
