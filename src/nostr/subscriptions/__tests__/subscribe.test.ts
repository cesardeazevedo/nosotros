import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import { READ } from '@/nostr/types'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribe } from '../subscribe'

describe('Nostrctx', () => {
  test('assert events from server and cache', async ({ createMockRelay, createContext }) => {
    const ctx = createContext({ settings: { outbox: false } })
    const events = [
      fakeEvent({ id: '1', pubkey: '1', created_at: 1 }),
      fakeEvent({ id: '2', pubkey: '2', created_at: 2 }),
      fakeEvent({ id: '3', pubkey: '3', created_at: 3 }),
      fakeEvent({ id: '4', pubkey: '4', created_at: 4 }),
    ]
    const relay1 = createMockRelay(RELAY_1, events)
    const relay2 = createMockRelay(RELAY_2, events)

    const filter = { kinds: [1], authors: ['1', '2', '3'] }
    const relays = [RELAY_1, RELAY_2]

    const $1 = subscribe(filter, { ...ctx, relays })
    const $2 = subscribe(filter, { ...ctx, relays })

    const spy1 = subscribeSpyTo($1)
    const spy2 = subscribeSpyTo($2)
    await spy1.onComplete()
    await spy2.onComplete()
    expect(spy1.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3'])
    expect(spy2.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3'])

    const $3 = subscribe({ kinds: [1], authors: ['1', '2', '3', '4'] }, { ...ctx, relays })
    const spy3 = subscribeSpyTo($3)
    await spy3.onComplete()
    await relay1.close()
    await relay2.close()
    expect(spy3.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3', '4'])
    // todo: stub verifyWorker
  })

  test('assert subscription on inbox relays only', async ({ createMockRelay, createContext, insertRelayList }) => {
    const pubkey = '1'
    await insertRelayList({
      pubkey,
      tags: [
        ['r', RELAY_1],
        ['r', RELAY_2, 'read'],
        ['r', RELAY_3, 'write'],
      ],
    })
    const relay1 = createMockRelay(RELAY_1, [])
    const relay2 = createMockRelay(RELAY_2, [])
    const relay3 = createMockRelay(RELAY_3, [])

    const ctx = createContext({ pubkey, permission: READ, settings: { outbox: false } })
    const inboxSpy = subscribeSpyTo(ctx.inbox$)
    const outboxSpy = subscribeSpyTo(ctx.outbox$)
    await inboxSpy.onComplete()
    await outboxSpy.onComplete()
    expect(inboxSpy.getValues()).toStrictEqual([[RELAY_1, RELAY_2]])
    expect(outboxSpy.getValues()).toStrictEqual([[RELAY_1, RELAY_3]])

    const $ = subscribe({ kinds: [1], authors: ['1'] }, ctx)
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay1.close()
    await relay2.close()
    await relay3.close()
    const req = ['REQ', '1', { authors: ['1'], kinds: [1] }]
    const close = ['CLOSE', '1']
    expect(relay1.received).toStrictEqual([req, close])
    expect(relay2.received).toStrictEqual([req, close])
    // outbox relay received no subscriptions
    expect(relay3.received).toStrictEqual([])
  })
})
