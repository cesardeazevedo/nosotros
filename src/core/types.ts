import type { Event, Filter } from 'nostr-tools'

export type NostrEvent = Event
export type NostrFilter = Filter

export enum ClientToRelay {
  REQ = 'REQ',
  AUTH = 'AUTH',
  EVENT = 'EVENT',
  CLOSE = 'CLOSE',
  NEG_OPEN = 'NEG-OPEN',
  NEG_MSG = 'NEG-MSG',
  NEG_CLOSE = 'NEG-CLOSE',
}

export enum RelayToClient {
  OK = 'OK',
  AUTH = 'AUTH',
  EOSE = 'EOSE',
  EVENT = 'EVENT',
  NOTICE = 'NOTICE',
  CLOSED = 'CLOSED',
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
  idHints?: Record<string, string[]>
}
