import { DEFUNCT_RELAYS, FALLBACK_RELAYS, OUTBOX_RELAYS } from '@/constants/relays'
import { queryClient } from '@/hooks/query/queryClient'
import { relayInfoQueryOptions } from '@/hooks/query/useRelayInfo'
import { Pool } from 'core/pool'
import { Relay } from 'core/Relay'
import { from } from 'rxjs'
import { subscribeRelayStats } from '../hooks/subscriptions/subscribeRelayStats'

export const pool = new Pool({
  blacklist: [],

  allowLocalConnection: false,

  open(url) {
    const relay = new Relay(url, { info$: from(queryClient.fetchQuery(relayInfoQueryOptions(url))) })
    subscribeRelayStats(relay)
    return relay
  },
})

OUTBOX_RELAYS.forEach((relay) => pool.get(relay))
FALLBACK_RELAYS.forEach((relay) => pool.get(relay))

// These dead are annoying and people still keep them in their lists
DEFUNCT_RELAYS.forEach((relay) => pool.blacklist(relay))
