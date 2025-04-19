import type { RelayInformation } from 'nostr-tools/nip11'
import type { Observable } from 'rxjs'
import { catchError, EMPTY, filter, map, Subject } from 'rxjs'
import { webSocket, type WebSocketSubject } from 'rxjs/webSocket'
import { formatRelayUrl } from './helpers/formatRelayUrl'
import { ofAuth } from './operators/ofAuth'
import { ofAuthOk } from './operators/ofAuthOk'
import { ofNotice } from './operators/ofNotice'
import type { MessageReceived } from './types'

type RelayOptions = {
  info$: Observable<RelayInformation>
}

export class Relay {
  url: string
  websocket$: WebSocketSubject<MessageReceived>

  message$: Observable<MessageReceived>
  auth$: Observable<[url: string, challenge: string]>
  authOk$: Observable<[url: string, challenge: string]>
  notice$: Observable<[url: string, msg: string]>

  open$ = new Subject()
  close$ = new Subject()
  closing$ = new Subject()

  info$: Observable<RelayInformation> | undefined

  constructor(url: string, options?: RelayOptions) {
    this.url = formatRelayUrl(url)

    this.websocket$ = webSocket({
      url: this.url,
      openObserver: this.open$,
      closeObserver: this.close$,
      closingObserver: this.closing$,
    })

    this.message$ = this.websocket$.asObservable().pipe(
      // filter out bad data by some relays
      filter((msg) => Array.isArray(msg) && typeof msg[0] === 'string'),
      catchError(() => EMPTY),
    )

    this.auth$ = this.message$.pipe(
      ofAuth(),
      map((msg) => [this.url, msg[1]]),
    )

    this.authOk$ = this.message$.pipe(
      ofAuthOk(),
      map((msg) => [this.url, msg[1]]),
    )

    this.notice$ = this.message$.pipe(
      ofNotice(),
      map((msg) => [this.url, msg[1]]),
    )

    this.info$ = options?.info$
  }
}
