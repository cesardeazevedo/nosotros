import { FIXED_RELAYS } from 'constants/relays'
import { observable, runInAction } from 'mobx'
import { pickBy } from 'utils/utils'
import { Relay } from './relay'

export class Pool {
  urls: string[]
  relays = new Map<string, Relay>()
  blacklist = observable.set<string>()

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

  getRelay(_url: string): Relay | undefined {
    const url = _url.replace(/\/$/, '')
    if (url.startsWith('wss://') || import.meta.env.MODE === 'testing') {
      if (!this.relays.has(url) && !this.blacklist.has(url)) {
        const relay = new Relay(url)
        this.relays.set(url, relay)
        relay.websocket.subscribe({
          error: () => {
            this.relays.delete(url)
            runInAction(() => {
              this.blacklist.add(url)
            })
          },
        })
        return relay
      }
      return this.relays.get(url) as Relay
    }
  }
}
