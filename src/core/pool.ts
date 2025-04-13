import { LRUCache } from 'lru-cache'
import { distinct, mergeAll, mergeMap, of, Subject } from 'rxjs'
import { formatRelayUrl } from './helpers/formatRelayUrl'
import { Relay } from './Relay'

type Options = {
  blacklist?: Array<{ pattern: RegExp }>
  open?: (url: string) => Relay
  allowLocalConnection?: boolean
}

export class Pool {
  relays = new Map<string, Relay>()
  blacklisted = new LRUCache({
    ttl: 30000,
    ttlAutopurge: true,
  })

  private relaysSubject = new Subject<Relay>()
  relays$ = this.relaysSubject.asObservable()

  messages$ = this.relays$.pipe(
    mergeMap((relay) => of([relay.url, relay.message$])),
    mergeAll(),
  )

  auths$ = this.relays$.pipe(
    mergeMap((relay) => relay.auth$),
    distinct((value) => value[0] + value[1]),
  )

  notices$ = this.relays$.pipe(mergeMap((relay) => relay.notice$))

  constructor(private options?: Options) {}

  private create(url: string) {
    const relay = this.options?.open?.(url) || new Relay(url)
    this.relays.set(url, relay)
    this.relaysSubject.next(relay)

    // Stablish WebSocket connection
    relay.websocket$.subscribe({
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

  reset() {
    this.relays.clear()
    this.blacklisted.clear()
  }

  delete(url: string) {
    this.relays.delete(url)
  }

  blacklist(url: string) {
    this.blacklisted.set(url, true)
  }

  get(url: string): Relay | undefined {
    url = formatRelayUrl(url)
    if (!url.startsWith('wss://') && this.options?.allowLocalConnection !== true) {
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
    return this.create(url)
  }
}
