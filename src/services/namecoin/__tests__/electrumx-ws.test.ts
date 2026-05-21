import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { wsRpcBatch } from '../electrumx-ws'

/**
 * Minimal controllable WebSocket stub. Lets the test schedule frames
 * (including server-initiated JSON-RPC requests) without a real network.
 */
class FakeWebSocket {
  static instances: FakeWebSocket[] = []
  readonly url: string
  readyState = 0
  sent: string[] = []
  private listeners: Record<string, Array<(ev: unknown) => void>> = {}

  constructor(url: string) {
    this.url = url
    FakeWebSocket.instances.push(this)
    // Open asynchronously so callers can attach listeners first.
    queueMicrotask(() => {
      this.readyState = 1
      this.dispatch('open', {})
    })
  }

  addEventListener(type: string, fn: (ev: unknown) => void) {
    ;(this.listeners[type] ||= []).push(fn)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    this.readyState = 3
  }

  // Test helper: deliver a frame to the client.
  emit(payload: object | string) {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload)
    this.dispatch('message', { data })
  }

  private dispatch(type: string, ev: unknown) {
    for (const fn of this.listeners[type] || []) fn(ev)
  }
}

describe('wsRpcBatch — bidirectional JSON-RPC id matching', () => {
  const originalWebSocket = globalThis.WebSocket
  beforeEach(() => {
    FakeWebSocket.instances = []
    // @ts-expect-error — installing a minimal stub for the test
    globalThis.WebSocket = FakeWebSocket
  })
  afterEach(() => {
    globalThis.WebSocket = originalWebSocket
    vi.useRealTimers()
  })

  it('drops a server-initiated blockchain.headers.subscribe push that arrives before the real response', async () => {
    const calls = [
      { method: 'server.version', params: ['test/0.1', '1.4'] },
      { method: 'blockchain.scripthash.get_history', params: ['deadbeef'] },
    ]

    const batchPromise = wsRpcBatch('ws://fake', calls, 5000)

    // Wait one microtask tick so the FakeWebSocket fires its `open` event
    // and the first request is sent.
    await Promise.resolve()
    await Promise.resolve()

    const ws = FakeWebSocket.instances[0]
    expect(ws).toBeDefined()
    expect(ws.sent.length).toBe(1)
    const firstSent = JSON.parse(ws.sent[0])
    expect(firstSent.method).toBe('server.version')
    expect(firstSent.id).toBe(1)

    // Server-initiated push arrives BEFORE the response to call #1.
    // Without id-matching, the old code would treat this as the result of
    // server.version, advance callIndex, and corrupt the batch.
    ws.emit({
      jsonrpc: '2.0',
      method: 'blockchain.headers.subscribe',
      params: [{ height: 999999, hex: 'deadbeefcafe' }],
    })

    // Real response to call #1.
    ws.emit({ jsonrpc: '2.0', id: 1, result: ['nosotros-electrumx', '1.4'] })

    // Microtask flush so `sendNext()` for call #2 fires.
    await Promise.resolve()
    await Promise.resolve()

    expect(ws.sent.length).toBe(2)
    const secondSent = JSON.parse(ws.sent[1])
    expect(secondSent.method).toBe('blockchain.scripthash.get_history')
    expect(secondSent.id).toBe(2)

    // Another server push between calls — must also be ignored.
    ws.emit({ jsonrpc: '2.0', method: 'server.banner', params: ['hello'] })

    // Real response to call #2.
    const history = [{ tx_hash: 'aa'.repeat(32), height: 700000 }]
    ws.emit({ jsonrpc: '2.0', id: 2, result: history })

    const results = await batchPromise
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual(['nosotros-electrumx', '1.4'])
    expect(results[1]).toEqual(history)
  })

  it('matches responses by id even when they arrive concatenated in one frame', async () => {
    const calls = [{ method: 'server.version', params: [] }]
    const batchPromise = wsRpcBatch('ws://fake', calls, 5000)

    await Promise.resolve()
    await Promise.resolve()

    const ws = FakeWebSocket.instances[0]
    // Server push + response delivered in a single newline-separated frame.
    const push = JSON.stringify({ jsonrpc: '2.0', method: 'blockchain.relayfee', params: [0.00001] })
    const response = JSON.stringify({ jsonrpc: '2.0', id: 1, result: 'ok' })
    ws.emit(push + '\n' + response)

    const results = await batchPromise
    expect(results).toEqual(['ok'])
  })
})
