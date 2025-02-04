import type { Signer } from '@/core/signers/signer'
import type { MessageReceived, NostrFilter } from 'core/types'
import { ClientToRelay, RelayToClient } from 'core/types'
import { matchFilters, type NostrEvent, type UnsignedEvent } from 'nostr-tools'
import WS from 'vitest-websocket-mock'

export function relaySendEvents(server: WS, reqId: string, messages: unknown[]) {
  messages.forEach((message) => server.send([RelayToClient.EVENT, reqId, message]))
}

export function relaySendNEGMsg(server: WS, reqId: string, message: string) {
  server.send([RelayToClient.NEG_MSG, reqId, message])
}

export function relaySendOK(server: WS, message: [string, boolean, string]) {
  server.send([RelayToClient.OK, ...message])
}

export function relaySendEose(server: WS, reqId: string) {
  server.send([RelayToClient.EOSE, reqId])
}

export function relaySendNotice(server: WS, msg: string) {
  server.send([RelayToClient.NOTICE, msg])
}

export async function expectRelayReceived(server: WS, ...filters: unknown[]): Promise<string> {
  const nextMessage = (await server.nextMessage) as MessageReceived
  expect(nextMessage[0]).toStrictEqual(ClientToRelay.REQ)
  expect(nextMessage[1]).toStrictEqual(expect.any(String))
  expect(nextMessage.slice(2)).toStrictEqual(filters)
  return nextMessage[1]
}

export async function expectRelayReceivedNEG(server: WS, filter: NostrFilter, msg: string): Promise<string> {
  const nextMessage = (await server.nextMessage) as MessageReceived
  expect(nextMessage[0]).toStrictEqual(ClientToRelay.NEG_OPEN)
  expect(nextMessage[1]).toStrictEqual(expect.any(String))
  expect(nextMessage[2]).toStrictEqual(filter)
  expect(nextMessage[3]).toStrictEqual(msg)
  return nextMessage[1]
}

export async function expectRelayReceivedClose(server: WS): Promise<string> {
  const nextMessage = (await server.nextMessage) as MessageReceived
  expect(nextMessage[0]).toStrictEqual(ClientToRelay.CLOSE)
  expect(nextMessage[1]).toStrictEqual(expect.any(String))
  return nextMessage[1]
}

export async function expectRelayPublish(server: WS, event: NostrEvent): Promise<void> {
  const nextMessage = (await server.nextMessage) as MessageReceived
  expect(nextMessage[0]).toStrictEqual(ClientToRelay.EVENT)
  expect(nextMessage[1]).toStrictEqual(event)
}

export class TestSigner implements Signer {
  name = 'test_signer'

  sign(event: UnsignedEvent): Promise<NostrEvent> {
    return Promise.resolve(event as NostrEvent)
  }

  encrypt(_: string, msg: string): Promise<string> {
    return Promise.resolve(msg)
  }

  decrypt(_: string, msg: string): Promise<string> {
    return Promise.resolve(msg)
  }
}

export class RelayServer extends WS {
  public received = [] as [keyof typeof ClientToRelay, string, NostrFilter[]][]
  public sent = [] as [keyof typeof RelayToClient, string, NostrEvent][]
  private _reqCount = 0

  constructor(
    public url: string,
    public db: NostrEvent[],
  ) {
    super(url)

    this.on('connection', (socket) => {
      socket.on('message', (msg) => {
        const data = JSON.parse(msg as string) as [keyof typeof ClientToRelay, string, NostrFilter[]]
        const [verb, req, ..._filters] = data
        switch (verb) {
          case 'REQ': {
            this._reqCount++
            const filters = _filters.flat()
            db.forEach((event) => {
              if (matchFilters(filters, event)) {
                this.sent.push(['EVENT', this.reqCount, event])
                const res = ['EVENT', req, event] as [keyof typeof RelayToClient, string, NostrEvent]
                socket.send(JSON.stringify(res))
              }
            })
            socket.send(JSON.stringify(['EOSE', req]))
          }
        }
        this.received.push([verb, this.reqCount, ..._filters])
      })
    })
  }

  private get reqCount() {
    return this._reqCount.toString()
  }

  async close() {
    super.close()
    await this.closed
    await new Promise<void>((resolve) => setTimeout(resolve, 1000))
  }
}
