/* eslint-disable no-empty-pattern */
import { test as base } from 'vitest'
import WS from 'vitest-websocket-mock'

const defaultRelays = [
  'wss://relay1.com',
  'wss://relay2.com',
  'wss://relay3.com',
  'wss://relay4.com',
  'wss://relay5.com',
]

interface Fixtures {
  relay: WS
  relay2: WS
  relay3: WS
  relay4: WS
  relay5: WS
}

export const RELAY_1 = defaultRelays[0]
export const RELAY_2 = defaultRelays[1]
export const RELAY_3 = defaultRelays[2]
export const RELAY_4 = defaultRelays[3]
export const RELAY_5 = defaultRelays[4]

const relay3 = new WS(RELAY_3, { jsonProtocol: true })
const relay4 = new WS(RELAY_4, { jsonProtocol: true })
const relay5 = new WS(RELAY_5, { jsonProtocol: true })

export const test = base.extend<Fixtures>({
  relay: async ({ }, use) => {
    const relay = new WS(RELAY_1, { jsonProtocol: true })
    await use(relay)
    relay.close()
  },
  relay2: async ({ }, use) => {
    const relay = new WS(RELAY_2, { jsonProtocol: true })
    await use(relay)
    relay.close()
  },
  relay3: async ({ }, use) => {
    await use(relay3)
  },
  relay4: async ({ }, use) => {
    await use(relay4)
  },
  relay5: async ({ }, use) => {
    await use(relay5)
  },
})
