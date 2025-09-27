import { Kind } from '@/constants/kinds'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { PublisherOptions } from '@/core/NostrPublish'
import { subscribeLastEvent } from '@/hooks/subscriptions/subscribeLast'
import { EMPTY, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { UserRelay } from '../types'
import { addPermission, parseRelayList, parseRelayListToTags, revokePermission } from '../types'
import { publish } from './publish'

export function publishRelayList(userRelay: UserRelay, revoke: boolean, options: PublisherOptions) {
  const { pubkey } = userRelay
  const ctx: NostrContext = { network: 'REMOTE_ONLY', outbox: true, relays: OUTBOX_RELAYS }
  const filter = { kinds: [Kind.RelayList], authors: [pubkey] }

  return subscribeLastEvent(ctx, filter).pipe(
    mergeMap((event) => {
      if (event) {
        const { relayList = [] } = parseRelayList(event)
        const data = { ...userRelay, relay: formatRelayUrl(userRelay.relay) }
        const tags = parseRelayListToTags(revoke ? revokePermission(relayList, data) : addPermission(relayList, data))
        return publish(
          { content: event.content, pubkey, kind: Kind.RelayList, tags },
          {
            ...options,
            relays: OUTBOX_RELAYS,
          },
        )
      }
      return EMPTY
    }),
  )
}
