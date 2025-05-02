import type { Signer } from '@/core/signers/signer'
import type { NostrFilter } from 'core/types'
import { ClientToRelay, RelayToClient } from 'core/types'
import { matchFilters, type NostrEvent } from 'nostr-tools'
import WS from 'vitest-websocket-mock'

export function relaySendEvents(server: WS, reqId: string, messages: unknown[]) {
  messages.forEach((message) => server.send([RelayToClient.EVENT, reqId, message]))
}

export function relaySendNotice(server: WS, msg: string) {
  server.send([RelayToClient.NOTICE, msg])
}

export class TestSigner implements Signer {
  name = 'test_signer'

  sign(event: NostrEvent): Promise<NostrEvent> {
    return Promise.resolve({
      ...event,
      pubkey: event.pubkey || '',
      id: event.id || Math.random().toString().slice(2),
      sig: event.sig || '',
    } as NostrEvent)
  }

  encrypt(_: string, msg: string): Promise<string> {
    return Promise.resolve(msg)
  }

  decrypt(_: string, msg: string): Promise<string> {
    return Promise.resolve(msg)
  }
}

export class RelayServer extends WS {
  public received = [] as unknown[]
  public sent = [] as [keyof typeof RelayToClient, string, NostrEvent][]

  private _reqCount = 0

  constructor(
    public url: string,
    public db: NostrEvent[],
  ) {
    super(url)

    this.on('connection', (socket) => {
      socket.on('message', (msg) => {
        const data = JSON.parse(msg as string)
        const [verb] = data
        switch (verb) {
          case ClientToRelay.REQ: {
            const [, req, ..._filters] = data as [keyof typeof ClientToRelay, string, NostrFilter[]]
            this._reqCount++
            const filters = _filters.flat()
            db.forEach((event) => {
              if (matchFilters(filters, event)) {
                this.sent.push([RelayToClient.EVENT, this.reqCount, event])
                const res = [RelayToClient.EVENT, req, event] as [keyof typeof RelayToClient, string, NostrEvent]
                socket.send(JSON.stringify(res))
              }
            })
            socket.send(JSON.stringify([RelayToClient.EOSE, req]))
            this.received.push([verb, this.reqCount, ..._filters])
            break
          }
          case ClientToRelay.AUTH: {
            const [, event] = data as [string, NostrEvent]
            this.received.push([RelayToClient.OK, event.id])
            break
          }
          case ClientToRelay.EVENT: {
            const [, event] = data as [string, NostrEvent]
            const exists = this.db.find((x) => x.id === event.id)
            socket.send(
              JSON.stringify([RelayToClient.OK, event.id, !exists, exists ? 'status: duplicated event' : 'status: OK']),
            )
            this.received.push([verb, event])
            break
          }
          case ClientToRelay.CLOSE: {
            this.received.push([ClientToRelay.CLOSE, this.reqCount])
            break
          }
        }
      })
    })
  }

  private get reqCount() {
    return this._reqCount.toString()
  }

  async close() {
    super.close()
    await this.closed
    await new Promise<void>((resolve) => setTimeout(resolve, 500))
  }
}
