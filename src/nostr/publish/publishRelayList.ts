import { Kind } from '@/constants/kinds'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { ofKind } from '@/core/operators/ofKind'
import { start } from '@/core/operators/start'
import { EMPTY, last, map, merge, mergeMap, of } from 'rxjs'
import type { NostrClient } from '../nostr'
import { parseEventMetadata } from '../operators/parseMetadata'
import type { NostrEventRelayList, UserRelay } from '../types'
import { addPermission, metadataSymbol, parseRelayListToTags, revokePermission } from '../types'
import { publish } from './publish'

const kinds = [Kind.RelayList]

export function publishRelayList(client: NostrClient, userRelay: UserRelay, revoke: boolean) {
  const { pubkey } = client
  if (pubkey) {
    const filter = { kinds, authors: [pubkey] }
    const options = { relays: of(OUTBOX_RELAYS) }
    const sub = client.createSubscription(filter, options)

    return of(sub).pipe(
      start(client.pool),
      map(([, event]) => event),
      parseEventMetadata(),
      ofKind<NostrEventRelayList>(kinds),
      last(undefined, null),
      mergeMap((event) => {
        if (event) {
          const relayList = event[metadataSymbol]?.relayList || []
          const data = { ...userRelay, relay: formatRelayUrl(userRelay.relay) }
          const tags = parseRelayListToTags(revoke ? revokePermission(relayList, data) : addPermission(relayList, data))
          return publish(
            client,
            { content: event.content, kind: Kind.RelayList, tags },
            {
              relays: merge(of(OUTBOX_RELAYS), client.inbox$),
            },
          )
        }
        return EMPTY
      }),
    )
  }
  return EMPTY
}
