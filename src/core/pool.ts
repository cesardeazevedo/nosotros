import { LRUCache } from 'lru-cache'
import { of } from 'rxjs'
import { formatRelayUrl } from './helpers/formatRelayUrl'
import type { NostrSubscription } from './NostrSubscription'
import { onAuth } from './operators/onAuth'
import { start } from './operators/start'
import { Relay } from './Relay'
import type { NostrFilter } from './types'

type Options = {
  blacklist?: Array<{ pattern: RegExp }>
  open?: (url: string) => Relay
  auth?: (relay: Relay, challenge: string) => void
}

export class Pool {
  relays = new Map<string, Relay>()
  blacklisted = new LRUCache({
    ttl: 30000,
    ttlAutopurge: true,
  })

  constructor(private options?: Options) { }

  private newRelay(url: string) {
    const relay = this.options?.open?.(url) || new Relay(url)
    this.relays.set(url, relay)

    // Stablish WebSocket connection
    relay.websocket$.pipe(onAuth((challenge) => this.options?.auth?.(relay, challenge))).subscribe({
      error: () => {
        this.delete(url)
        this.blacklist(url)
      },
      complete: () => {
        this.delete(url)
      },
    })

    return relay
  }

  delete(url: string) {
    this.relays.delete(url)
  }

  blacklist(url: string) {
    this.blacklisted.set(url, true)
  }

  getOrAddRelay(url: string): Relay | undefined {
    url = formatRelayUrl(url)
    if (!url.startsWith('wss://') && import.meta.env.MODE !== 'testing') {
      return
    }
    if (this.blacklisted.has(url)) {
      return
    }
    if (this.options?.blacklist?.some((x) => x.pattern.exec(url))) {
      return
    }
    if (this.relays.has(url)) {
      return this.relays.get(url)
    }
    return this.newRelay(url)
  }

  subscribe(sub: NostrSubscription, refine?: (filters: NostrFilter[]) => NostrFilter[]) {
    return of(sub).pipe(start(this, refine))
  }
}
