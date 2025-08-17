import { OUTBOX_RELAYS } from '@/constants/relays'
import { SubscriptionBatcher } from '@/core/SubscriptionBatcher'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { subscribeRemote } from './subscriptions/subscribeStrategy'

export const batcher = new SubscriptionBatcher<NostrEventDB>((filter, relayHints, cached) =>
  subscribeRemote(
    {
      outbox: true,
      relayHints,
    },
    filter,
    cached,
  ),
)

export const batcherRelayList = new SubscriptionBatcher<NostrEventDB>((filter, relayHints, cached) =>
  subscribeRemote(
    {
      outbox: false,
      relays: OUTBOX_RELAYS,
      relayHints,
    },
    filter,
    cached,
  ),
)
