import { Event, Filter as NostrFilter, validateEvent, verifySignature } from 'nostr-tools'
import { Observable, asyncScheduler, filter, merge, observeOn, retry, share, tap } from 'rxjs'
import { WebSocketSubject, webSocket } from 'rxjs/webSocket'
import { Subscription, SubscriptionEvents } from './subscription'

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
  onCount$: Observable<MessageReceived>
  onNotice$: Observable<MessageReceived>
  onEose$: Observable<MessageReceived>

  subscriptions: Map<string, Subscription> = new Map()

  constructor(url: string) {
    this.url = url.replace(/\/$/, '')
    this.websocket = webSocket({
      url: this.url,
      closeObserver: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: (event) => {
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
        if (sub && validateEvent(event) && (sub.skipVerification || verifySignature(event))) {
          sub.event$.next([this.url, event])
        }
      }),
      share(),
    )

    this.onCount$ = this.websocket.pipe(
      ofMessage(SubscriptionEvents.COUNT),
      tap((message) => {
        const id = message[1]
        const event = message[2]
        const sub = this.subscriptions.get(id)
        sub?.count$.next([this.url, event])
      }),
    )

    this.onNotice$ = this.websocket.pipe(ofMessage(RelayEvents.NOTICE))

    merge(
      this.onEvent$,
      this.onCount$,
      this.onEose$,
      this.onNotice$,
      //
    )
      // Reconnect when the websocket closes
      .pipe(retry({ count: 3, delay: 5000 }))
      .subscribe({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (error) => {
          // console.log('ERROR', error)
        },
      })
  }

  close() {
    this.websocket.complete()
  }

  publish() {}

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
