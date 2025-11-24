import { Negentropy, NegentropyStorageVector } from '@/core/operators/Negentropy'
import type { Signer } from '@/core/signers/signer'
import type { RelayReceived } from 'core/types'
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

export type MockRelayOptions = {
  // negentropy options
  frameSizeLimit?: number
}

export class RelayServer extends WS {
  public received = [] as RelayReceived[]
  public sent = [] as [keyof typeof RelayToClient, string, NostrEvent][]

  private _reqCount = 0

  private negentropyInstances = new Map<string, Negentropy>()

  constructor(
    public url: string,
    public db: NostrEvent[],
    public options?: MockRelayOptions,
  ) {
    super(url)
    const storage = new NegentropyStorageVector()
    db.filter((event) => event.id.length === 64).forEach((event) => {
      storage.insert(event.created_at, event.id)
    })
    storage.seal()

    this.on('connection', (socket) => {
      socket.on('message', async (msg) => {
        const data = JSON.parse(msg as string) as RelayReceived
        const [verb] = data
        switch (verb) {
          case ClientToRelay.REQ: {
            const [, req, ..._filters] = data
            this._reqCount++
            const filters = _filters.flat()
            db.forEach((event) => {
              if (matchFilters(filters, event)) {
                this.sent.push([RelayToClient.EVENT, this.reqCount, event])
                const res = [RelayToClient.EVENT, req, event]
                socket.send(JSON.stringify(res))
              }
            })
            socket.send(JSON.stringify([RelayToClient.EOSE, req]))
            this.received.push([verb, this.reqCount, ..._filters])
            break
          }
          case ClientToRelay.AUTH: {
            this.received.push(data)
            break
          }
          case ClientToRelay.EVENT: {
            const [, event] = data as [string, NostrEvent]
            const exists = this.db.find((x) => x.id === event.id)
            socket.send(
              JSON.stringify([RelayToClient.OK, event.id, !exists, exists ? 'status: duplicated event' : 'status: OK']),
            )
            this.received.push(data)
            break
          }
          case ClientToRelay.NEG_OPEN: {
            const [, reqId, filter, clientMsg] = data

            const negentropy = new Negentropy(storage, options?.frameSizeLimit)
            this.negentropyInstances.set(reqId, negentropy)
            const [relayMsg] = await negentropy.reconcile(clientMsg)
            this.received.push([verb, this.reqCount, filter, clientMsg])

            if (relayMsg) {
              socket.send(JSON.stringify([RelayToClient.NEG_MSG, reqId, relayMsg]))
            } else {
              socket.send(JSON.stringify([RelayToClient.NEG_CLOSE, reqId]))
            }
            break
          }
          case ClientToRelay.NEG_MSG: {
            const [, reqId, clientMsg] = data
            const negentropy = this.negentropyInstances.get(reqId)

            if (!negentropy) {
              socket.send(JSON.stringify([RelayToClient.NEG_ERR, reqId, 'no negentropy instance']))
              break
            }

            const [relayMsg] = await negentropy.reconcile(clientMsg)
            this.received.push([verb, reqId, clientMsg])

            if (relayMsg) {
              socket.send(JSON.stringify([RelayToClient.NEG_MSG, reqId, relayMsg]))
            } else {
              socket.send(JSON.stringify([RelayToClient.NEG_CLOSE, reqId]))
              this.negentropyInstances.delete(reqId)
            }
            break
          }
          case ClientToRelay.NEG_CLOSE: {
            this.received.push([verb, this.reqCount])
            break
          }
          case ClientToRelay.CLOSE: {
            this.received.push([verb, this.reqCount])
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
    await new Promise<void>((resolve) => setTimeout(resolve, 500))
    super.close()
    await this.closed
  }
}
