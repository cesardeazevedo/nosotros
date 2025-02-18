import { Subject } from 'rxjs'
import { webSocket, type WebSocketSubject } from 'rxjs/webSocket'
import { formatRelayUrl } from './helpers/formatRelayUrl'
import type { MessageReceived } from './types'

export class Relay {
  url: string
  websocket$: WebSocketSubject<MessageReceived>

  open$ = new Subject()
  close$ = new Subject()
  closing$ = new Subject()

  constructor(url: string) {
    this.url = formatRelayUrl(url)

    this.websocket$ = webSocket({
      url: this.url,
      openObserver: this.open$,
      closeObserver: this.close$,
      closingObserver: this.closing$,
    })
  }
}
