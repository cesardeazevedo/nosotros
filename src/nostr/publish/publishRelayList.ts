import { Kind } from '@/constants/kinds'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { PublisherOptions } from '@/core/NostrPublish'
import { start } from '@/core/operators/start'
import { EMPTY, last, map, mergeMap, of } from 'rxjs'
import { cacheReplaceablePrune } from '../cache'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { pool } from '../pool'
import { createSubscription } from '../subscriptions/createSubscription'
import type { UserRelay } from '../types'
import { addPermission, metadataSymbol, parseRelayListToTags, revokePermission } from '../types'
import { publish } from './publish'

const kinds = [Kind.RelayList]

export function publishRelayList(userRelay: UserRelay, revoke: boolean, options: PublisherOptions) {
  const { pubkey } = userRelay
  const filter = { kinds, authors: [pubkey] }
  cacheReplaceablePrune.delete([Kind.RelayList, pubkey].join(':'))
  const sub = createSubscription(filter, { relays: OUTBOX_RELAYS })

  return of(sub).pipe(
    start(pool),
    map(([, event]) => event),
    parseEventMetadata(),
    last(undefined, null),
    mergeMap((event) => {
      if (event) {
        const relayList = event[metadataSymbol]?.relayList || []
        const data = { ...userRelay, relay: formatRelayUrl(userRelay.relay) }
        const tags = parseRelayListToTags(revoke ? revokePermission(relayList, data) : addPermission(relayList, data))
        return publish(
          { content: event.content, pubkey, kind: Kind.RelayList, tags },
          {
            ...options,
            relays: of(OUTBOX_RELAYS),
          },
        )
      }
      return EMPTY
    }),
  )
}
