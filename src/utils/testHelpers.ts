import type { MessageReceived } from 'core/types'
import { MessageReceivedTypes, MessageSentTypes } from 'core/types'
import type WS from 'vitest-websocket-mock'

export function relaySendEvents(server: WS, reqId: string, messages: unknown[]) {
  messages.forEach((message) => server.send([MessageSentTypes.EVENT, reqId, message]))
}

export function relaySendEose(server: WS, reqId: string) {
  server.send([MessageReceivedTypes.EOSE, reqId])
}

export function relaySendClose(server: WS, reqId: string, msg: string) {
  server.send([MessageReceivedTypes.CLOSED, reqId, msg])
}

export function relaySendNotice(server: WS, msg: string) {
  server.send([MessageReceivedTypes.NOTICE, msg])
}

export async function expectRelayReceived(server: WS, ...message: unknown[]): Promise<string> {
  const nextMessage = (await server.nextMessage) as MessageReceived
  expect(nextMessage[0]).toStrictEqual(MessageSentTypes.REQ)
  expect(nextMessage[1]).toStrictEqual(expect.any(String))
  expect(nextMessage.slice(2)).toStrictEqual(message)
  return nextMessage[1]
}
