import type { MessageReceived } from 'core/types'
import { RelayToClient, ClientToRelay } from 'core/types'
import type WS from 'vitest-websocket-mock'

export function relaySendEvents(server: WS, reqId: string, messages: unknown[]) {
  messages.forEach((message) => server.send([RelayToClient.EVENT, reqId, message]))
}

export function relaySendOK(server: WS, message: [string, boolean, string]) {
  server.send([RelayToClient.OK, ...message])
}

export function relaySendEose(server: WS, reqId: string) {
  server.send([RelayToClient.EOSE, reqId])
}

export function relaySendClose(server: WS, reqId: string, msg: string) {
  server.send([RelayToClient.CLOSED, reqId, msg])
}

export function relaySendNotice(server: WS, msg: string) {
  server.send([RelayToClient.NOTICE, msg])
}

export async function expectRelayReceived(server: WS, ...message: unknown[]): Promise<string> {
  const nextMessage = (await server.nextMessage) as MessageReceived
  expect(nextMessage[0]).toStrictEqual(ClientToRelay.REQ)
  expect(nextMessage[1]).toStrictEqual(expect.any(String))
  expect(nextMessage.slice(2)).toStrictEqual(message)
  return nextMessage[1]
}

export async function expectRelayPublish(server: WS, ...message: unknown[]): Promise<void> {
  const nextMessage = (await server.nextMessage) as MessageReceived
  expect(nextMessage[0]).toStrictEqual(ClientToRelay.EVENT)
  expect(nextMessage.slice(1)).toStrictEqual(message)
}
