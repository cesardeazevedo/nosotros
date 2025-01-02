import type { Event, Filter } from 'nostr-tools'

export type NostrEvent = Event
export type NostrFilter = Filter

export enum ClientToRelay {
  REQ = 'REQ',
  EVENT = 'EVENT',
  CLOSE = 'CLOSE',
  NEG_OPEN = 'NEG-OPEN',
  NEG_MSG = 'NEG-MSG',
  NEG_CLOSE = 'NEG-CLOSE',
}

export enum RelayToClient {
  OK = 'ok',
  AUTH = 'auth',
  EOSE = 'eose',
  EVENT = 'event',
  NOTICE = 'notice',
  CLOSED = 'closed',
  NEG_MSG = 'NEG-MSG',
  NEG_ERR = 'NEG-ERR',
}

export type MessageReceivedEvent = [RelayToClient.EVENT, string, NostrEvent]
export type MessageReceivedEose = [RelayToClient.EOSE, string]
export type MessageReceivedOK = [RelayToClient.OK, string, boolean, string]
export type MessageReceivedAuth = [RelayToClient.AUTH, string]

export type MessageReceived = MessageReceivedEvent | MessageReceivedEose | MessageReceivedOK | MessageReceivedAuth

export type RelayHints = {
  authors?: Record<string, string[]>
  ids?: Record<string, string[]>
  fallback?: Record<string, string[]>
}
