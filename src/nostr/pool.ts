import { Pool } from 'core/pool'
import { Relay } from 'core/Relay'
import { subscribeRelayStats } from './stats'

export const pool = new Pool({
  blacklist: [],

  open(url) {
    const relay = new Relay(url)
    // collect relay stats
    subscribeRelayStats(relay)
    return relay
  },

  auth(relay: Relay, challenge: string) {
    console.log('AUTH', relay.url, challenge)
  },
})
