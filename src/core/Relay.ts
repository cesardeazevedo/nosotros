import { webSocket, type WebSocketSubject } from 'rxjs/webSocket'
import type { MessageReceived, NostrEvent } from './types'
import { MessageSentTypes } from './types'
import type { NostrSubscription } from './NostrSubscription'
import { of } from 'rxjs'
import { subscribe } from './operators/subscribe'


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
          this.connected = true
        }
      },
      closingObserver: {
        next: () => {
          this.connected = false
        }
      }
    })
  }

  subscribe(sub: NostrSubscription) {
    return of(sub).pipe(subscribe(this, sub.filters))
  }

  publish(event: NostrEvent) {
    this.websocket$.next([MessageSentTypes.EVENT, event] as never)
  }
}
