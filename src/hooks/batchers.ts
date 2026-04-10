import { settingsAtom } from '@/atoms/settings.atoms'
import { store } from '@/atoms/store'
import { EMBEDDINGS_RELAYS, OUTBOX_RELAYS } from '@/constants/relays'
import { SubscriptionBatcher } from '@/core/SubscriptionBatcher'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { QueryKey } from '@tanstack/react-query'
import { subscribeRemote } from './subscriptions/subscribeStrategy'

export const batcher = new SubscriptionBatcher<NostrEventDB>((filter, relayHints, cached, meta) =>
  subscribeRemote(
    {
      outbox: true,
      relayHints,
      maxRelaysPerUser: store.get(settingsAtom).maxRelaysPerUser,
      queryKey: meta?.queryKey as QueryKey | undefined,
      subId: meta?.subId,
      subscriptionGroupId: meta?.subscriptionGroupId,
    },
    filter,
    cached,
  ),
)

export const batcherDep = new SubscriptionBatcher<NostrEventDB>((filter, relayHints, cached, meta) =>
  subscribeRemote(
    {
      outbox: true,
      relayHints,
      subId: meta?.subId || 'deps',
      maxRelaysPerUser: store.get(settingsAtom).maxRelaysPerUser,
      queryKey: meta?.queryKey as QueryKey | undefined,
      subscriptionGroupId: meta?.subscriptionGroupId,
    },
    filter,
    cached,
  ),
)

export const batcherReplies = new SubscriptionBatcher<NostrEventDB>((filter, relayHints, cached, meta) =>
  subscribeRemote(
    {
      outbox: true,
      relayHints,
      maxRelaysPerUser: store.get(settingsAtom).maxRelaysPerUser,
      subId: meta?.subId || 'replies',
      queryKey: meta?.queryKey as QueryKey | undefined,
      subscriptionGroupId: meta?.subscriptionGroupId,
    },
    filter,
    cached,
  ),
)

export const batcherRelayList = new SubscriptionBatcher<NostrEventDB>((filter, relayHints, cached, meta) =>
  subscribeRemote(
    {
      outbox: false,
      relays: OUTBOX_RELAYS,
      maxRelaysPerUser: store.get(settingsAtom).maxRelaysPerUser,
      relayHints,
      queryKey: meta?.queryKey as QueryKey | undefined,
      subId: meta?.subId,
      subscriptionGroupId: meta?.subscriptionGroupId,
    },
    filter,
    cached,
  ),
)

export const batcherLocal = new SubscriptionBatcher<NostrEventDB>((filter, relayHints, cached, meta) =>
  subscribeRemote(
    {
      outbox: false,
      negentropy: false,
      relays: EMBEDDINGS_RELAYS,
      relayHints,
      queryKey: meta?.queryKey as QueryKey | undefined,
      subId: meta?.subId,
      subscriptionGroupId: meta?.subscriptionGroupId,
    },
    filter,
    cached,
  ),
)
