import { Pool } from 'core/pool'
import type { Relay } from 'core/Relay'

export const pool = new Pool({
  blacklist: [],

  auth(relay: Relay, challenge: string) {
    console.log('AUTH', relay.url, challenge)
  },
})
