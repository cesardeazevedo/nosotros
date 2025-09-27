import { settingsAtom } from '@/atoms/settings.atoms'
import { store } from '@/atoms/store'
import { OUTBOX_RELAYS } from '@/constants/relays'
import { SubscriptionBatcher } from '@/core/SubscriptionBatcher'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { subscribeRemote } from './subscriptions/subscribeStrategy'

export const batcher = new SubscriptionBatcher<NostrEventDB>((filter, relayHints, cached) =>
  subscribeRemote(
    {
      outbox: true,
      relayHints,
      maxRelaysPerUser: store.get(settingsAtom).maxRelaysPerUser,
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
      maxRelaysPerUser: store.get(settingsAtom).maxRelaysPerUser,
      relayHints,
    },
    filter,
    cached,
  ),
)
