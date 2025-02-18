import { Kind } from '@/constants/kinds'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { ofKind } from '@/core/operators/ofKind'
import { start } from '@/core/operators/start'
import { EMPTY, last, map, merge, mergeMap, of } from 'rxjs'
import { cacheReplaceablePrune } from '../cache'
import type { NostrContext } from '../context'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { pool } from '../pool'
import { createSubscription } from '../subscriptions/createSubscription'
import type { NostrEventRelayList, UserRelay } from '../types'
import { addPermission, metadataSymbol, parseRelayListToTags, revokePermission } from '../types'
import { publish } from './publish'

const kinds = [Kind.RelayList]

export function publishRelayList(ctx: NostrContext, userRelay: UserRelay, revoke: boolean) {
  const { pubkey } = ctx
  if (pubkey) {
    const filter = { kinds, authors: [pubkey] }
    const subOptions = { ...ctx.subOptions, relays: of(OUTBOX_RELAYS) }
    cacheReplaceablePrune.delete(`${Kind.RelayList}:${pubkey}`)
    const sub = createSubscription(filter, { ...ctx, subOptions })

    return of(sub).pipe(
      start(pool),
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
            ctx,
            { content: event.content, kind: Kind.RelayList, tags },
            {
              relays: merge(of(OUTBOX_RELAYS), ctx.inbox$),
            },
          )
        }
        return EMPTY
      }),
    )
  }
  return EMPTY
}
