import { LRUCache } from 'lru-cache'
import { formatRelayUrl } from './helpers/formatRelayUrl'
import { onAuth } from './operators/onAuth'
import { Relay } from './Relay'

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

  constructor(private options?: Options) {}

  private create(url: string) {
    const relay = this.options?.open?.(url) || new Relay(url)
    this.relays.set(url, relay)

    // Stablish WebSocket connection
    relay.websocket$
      .pipe(
        onAuth((challenge) => this.options?.auth?.(relay, challenge)),
        // TODO
        // retry({ count: 3, delay: 3000 })
      )
      .subscribe({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (error: Event) => {
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
    console.log('BLACKLIST????', url)
    this.blacklisted.set(url, true)
  }

  get(url: string): Relay | undefined {
    url = formatRelayUrl(url)
    if (this.blacklisted.has(url)) {
      return
    }
    if (this.options?.blacklist?.some((x) => x.pattern.exec(url))) {
      return
    }
    if (this.relays.has(url)) {
      return this.relays.get(url)
    }
    return this.create(url)
  }
}
