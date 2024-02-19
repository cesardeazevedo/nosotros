import type { Event, Filter as NostrFilter } from 'nostr-tools'
import { asyncScheduler, filter, merge, observeOn, share, tap, type Observable } from 'rxjs'
import { webSocket, type WebSocketSubject } from 'rxjs/webSocket'
import { SubscriptionEvents, type Subscription } from './subscription'

enum RelayEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  NOTICE = 'notice',
}

export enum MessageTypes {
  EVENT = 'EVENT',
  REQ = 'REQ',
  CLOSE = 'CLOSE',
}

export type MessageReceived = [string, string, Event]

export const ofMessage = (name: string) => filter<MessageReceived>((message) => message[0].toLowerCase() === name)

export class Relay {
  url: string

  websocket: WebSocketSubject<MessageReceived>

  onEvent$: Observable<MessageReceived>
  onNotice$: Observable<MessageReceived>
  onEose$: Observable<MessageReceived>

  subscriptions: Map<string, Subscription> = new Map()

  connected = false

  constructor(url: string) {
    this.url = url.replace(/\/$/, '')
    this.websocket = webSocket({
      url: this.url,
      openObserver: {
        next: () => {
          this.connected = true
        },
      },
      closeObserver: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: (event) => {
          this.connected = false
          // console.log('CLOSED', url, event)
        },
      },
    })

    this.onEose$ = this.websocket.pipe(
      ofMessage(SubscriptionEvents.EOSE),
      tap((message) => {
        const id = message[1]
        const sub = this.subscriptions.get(id)
        sub?.eose$.next()
      }),
      share(),
    )

    this.onEvent$ = this.websocket.pipe(
      ofMessage(SubscriptionEvents.EVENT),
      observeOn(asyncScheduler),
      tap((message) => {
        const id = message[1]
        const event = message[2] as Event
        const sub = this.subscriptions.get(id)
        sub?.event$?.next([this.url, event])
      }),
      share(),
    )

    this.onNotice$ = this.websocket.pipe(ofMessage(RelayEvents.NOTICE))

    merge(this.onEvent$, this.onEose$, this.onNotice$)
      // Reconnect when the websocket closes
      // .pipe(retry({ count: 3, delay: 5000 }))
      .subscribe({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (error) => {
          // console.log('ERROR', this.url, error)
        },
      })
  }

  close() {
    this.websocket.complete()
  }

  publish(event: Event) {
    this.websocket.next([MessageTypes.EVENT, event] as never)
  }

  subscribe(subscription: Subscription, ...data: NostrFilter[]): Subscription {
    const msg = [MessageTypes.REQ, subscription.id, ...data]
    this.subscriptions.set(subscription.id, subscription)
    this.websocket?.next(msg as never)
    return subscription
  }

  unsubscribe(subscription: Subscription) {
    this.subscriptions.delete(subscription.id)
    this.websocket.next([MessageTypes.CLOSE, subscription.id] as never)
  }
}
