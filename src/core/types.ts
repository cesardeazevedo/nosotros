import type { Event, Filter } from 'nostr-tools'
import type { WebSocketSubject } from 'rxjs/webSocket'

export type NostrEvent = Event
export type NostrFilter = Filter

export enum MessageSentTypes {
  REQ = 'REQ',
  EVENT = 'EVENT',
  CLOSE = 'CLOSE',
}

export enum MessageReceivedTypes {
  OK = 'ok',
  AUTH = 'auth',
  EOSE = 'eose',
  EVENT = 'event',
  NOTICE = 'notice',
  CLOSED = 'closed',
}

export type MessageReceived = [MessageReceivedTypes, string, NostrEvent]

export type RelayHints = {
  authors?: Record<string, string[]>
  ids?: Record<string, string[]>
  fallback?: Record<string, string[]>
}


export interface IRelay {
  url: string
  websocket$: WebSocketSubject<MessageReceived>
  publish: (event: NostrEvent) => void
}
