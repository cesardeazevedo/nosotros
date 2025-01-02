import type { NostrEvent } from 'nostr-tools'
import { mergeMap, of } from 'rxjs'
import { isAuthorTag } from './helpers/parseTags'
import type { RelaySelectionConfig } from './helpers/relaySelection'
import { toArrayRelay } from './mailbox'
import { READ } from './nips/nip65.relaylist'
import type { NostrClient } from './nostr'

export class InboxTracker {
  options: RelaySelectionConfig

  constructor(private client: NostrClient) {
    this.options = {
      permission: READ,
      ignore: client.inboxSets,
      maxRelaysPerUser: client.settings.maxRelaysPerUserInbox,
    }
  }

  subscribe(event: NostrEvent) {
    return of(event).pipe(
      mergeMap((event) => event.tags.filter((tag) => isAuthorTag(tag)).flatMap((tag) => tag[1])),
      mergeMap((pubkey) => this.client.mailbox.track(pubkey, this.options).pipe(toArrayRelay)),
    )
  }
}
