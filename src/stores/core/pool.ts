import { FIXED_RELAYS } from 'constants/relays'
import { pickBy } from 'utils/utils'
import { Relay } from './relay'

export class Pool {
  urls: string[]
  relays = new Map<string, Relay>()

  constructor(fixedRelays: string[] = FIXED_RELAYS) {
    this.urls = fixedRelays.slice()
  }

  initialize(urls: string[]) {
    this.urls.push(...urls)

    for (const url of this.urls) {
      this.getRelay(url)
    }
  }

  get fixedRelays() {
    return Object.values(pickBy(Object.fromEntries(this.relays), this.urls))
  }

  getRelay(url: string): Relay | undefined {
    if (url.startsWith('wss://')) {
      if (!this.relays.has(url)) {
        const relay = new Relay(url)
        this.relays.set(url, relay)
        return relay
      }
      return this.relays.get(url) as Relay
    }
  }
}
