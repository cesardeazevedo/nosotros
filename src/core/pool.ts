import { distinct, mergeAll, mergeMap, of, ReplaySubject } from 'rxjs'
import { formatRelayUrl } from './helpers/formatRelayUrl'
import { Relay } from './Relay'

type Options = {
  blacklist?: Array<{ pattern: RegExp }>
  open?: (url: string) => Relay
  allowLocalConnection?: boolean
}

export class Pool {
  relays = new Map<string, Relay>()
  blacklisted = new Set<string>()

  private relaysSubject = new ReplaySubject<Relay>()
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

  disconnect() {
    const relays = [...this.relays.values()]
    relays.forEach((relay) => relay.websocket$.complete())
  }

  reset() {
    this.disconnect()
    this.relays.clear()
    this.blacklisted.clear()
  }

  delete(url: string) {
    this.relays.delete(url)
  }

  blacklist(url: string) {
    this.blacklisted.add(url)
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
