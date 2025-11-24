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
  NEG_CLOSE = 'NEG-CLOSE',
}

export type MessageReceivedEvent = [RelayToClient.EVENT, string, NostrEvent]
export type MessageReceivedEose = [RelayToClient.EOSE, string]
export type MessageReceivedOK = [RelayToClient.OK, string, boolean, string]
export type MessageReceivedAuth = [RelayToClient.AUTH, string]
export type MessageReceivedNotice = [RelayToClient.NOTICE, string]
export type MessageReceivedNegError = [RelayToClient.NEG_ERR, string]

export type MessageReceived =
  | MessageReceivedEvent
  | MessageReceivedEose
  | MessageReceivedOK
  | MessageReceivedAuth
  | MessageReceivedNotice
  | MessageReceivedNegError

export type RelayReceivedReq = [ClientToRelay.REQ, string, ...NostrFilter[]]
export type RelayReceivedEvent = [ClientToRelay.EVENT, NostrEvent]
export type RelayReceivedClose = [ClientToRelay.CLOSE, string]
export type RelayReceivedAuth = [ClientToRelay.AUTH, NostrEvent]
export type RelayReceivedNegOpen = [ClientToRelay.NEG_OPEN, string, NostrFilter, string]
export type RelayReceivedNegMsg = [ClientToRelay.NEG_MSG, string, string]
export type RelayReceivedNegClose = [ClientToRelay.NEG_CLOSE, string]

export type RelayReceived =
  | RelayReceivedReq
  | RelayReceivedEvent
  | RelayReceivedClose
  | RelayReceivedAuth
  | RelayReceivedNegOpen
  | RelayReceivedNegMsg
  | RelayReceivedNegClose

export type RelayHints = {
  authors?: Record<string, string[]>
  ids?: Record<string, string[]>
  idHints?: Record<string, string[]>
}
