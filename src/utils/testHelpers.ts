import type WS from 'jest-websocket-mock'
import { MessageTypes, type MessageReceived } from 'stores/core/relay'
import { SubscriptionEvents } from 'stores/core/subscription'

export const delay = (timeout = 500) => new Promise((r) => setTimeout(r, timeout))

export async function sendMessages(server: WS, reqId: string, messages: unknown[]) {
  messages.forEach((message) => server.send([SubscriptionEvents.EVENT, reqId, message]))
  await delay(600)
}

export async function expectMessage(server: WS, ...message: unknown[]): Promise<string> {
  const nextMessage = (await server.nextMessage) as MessageReceived
  expect(nextMessage[0]).toStrictEqual(MessageTypes.REQ)
  expect(nextMessage[1]).toStrictEqual(expect.any(String))
  expect(nextMessage.slice(2)).toStrictEqual(message)
  return nextMessage[1]
}
