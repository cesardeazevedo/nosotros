import type { Event, Filter } from 'nostr-tools'
import type { WebSocketSubject } from 'rxjs/webSocket'

export type NostrEvent = Event
export type NostrFilter = Filter

export enum ClientToRelay {
  REQ = 'REQ',
  EVENT = 'EVENT',
  CLOSE = 'CLOSE',
}

export enum RelayToClient {
  OK = 'ok',
  AUTH = 'auth',
  EOSE = 'eose',
  EVENT = 'event',
  NOTICE = 'notice',
  CLOSED = 'closed',
}

export type MessageReceivedEvent = [RelayToClient.EVENT, string, NostrEvent]
export type MessageReceivedEose = [RelayToClient.EOSE, string]
export type MessageReceivedOK = [RelayToClient.OK, string, boolean, string]

export type MessageReceived = MessageReceivedEvent | MessageReceivedEose | MessageReceivedOK

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
