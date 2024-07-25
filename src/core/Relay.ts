import { of } from 'rxjs'
import { webSocket, type WebSocketSubject } from 'rxjs/webSocket'
import type { NostrSubscription } from './NostrSubscription'
import { subscribe } from './operators/subscribe'
import type { MessageReceived, NostrEvent } from './types'
import { ClientToRelay } from './types'

export class Relay {
  url: string
  websocket$: WebSocketSubject<MessageReceived>

  connected = false

  constructor(url: string) {
    this.url = url.replace(/\/$/, '')

    this.websocket$ = webSocket({
      url: this.url,
      openObserver: {
        next: () => {
          this.setConnected(true)
        },
      },
      closeObserver: {
        next: () => {
          this.setConnected(false)
        },
      },
      closingObserver: {
        next: () => {
          this.setConnected(false)
        },
      },
    })
  }

  setConnected(value: boolean) {
    this.connected = value
  }

  subscribe(sub: NostrSubscription) {
    return of(sub).pipe(subscribe(this, sub.filters))
  }

  publish(event: NostrEvent) {
    this.websocket$.next([ClientToRelay.EVENT, event] as never)
  }
}
