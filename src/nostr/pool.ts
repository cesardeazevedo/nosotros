import { Pool } from 'core/pool'
import { Relay } from 'core/Relay'
import { enqueueRelayInfo } from './nip11'
import { subscribeRelayStats } from './subscriptions/subscribeRelayStats'

export const pool = new Pool({
  blacklist: [],

  allowLocalConnection: false,

  open(url) {
    const relay = new Relay(url, { info$: enqueueRelayInfo(url) })
    subscribeRelayStats(relay)
    return relay
  },
})
