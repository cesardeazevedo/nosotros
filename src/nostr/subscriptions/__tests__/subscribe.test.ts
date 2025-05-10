import { RELAY_1, RELAY_2, RELAY_3, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { WRITE } from '@/nostr/types'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribe } from '../subscribe'

describe('subscribe()', () => {
  test('assert events from server and cache', async ({ createMockRelay }) => {
    const events = [
      fakeEvent({ id: '1', pubkey: '1', created_at: 1 }),
      fakeEvent({ id: '2', pubkey: '2', created_at: 2 }),
      fakeEvent({ id: '3', pubkey: '3', created_at: 3 }),
      fakeEvent({ id: '4', pubkey: '4', created_at: 4 }),
    ]
    const relay1 = createMockRelay(RELAY_1, events)
    const relay2 = createMockRelay(RELAY_2, events)
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [])

    const filter = { kinds: [1], authors: ['1', '2', '3'] }
    const relays = [RELAY_1, RELAY_2]

    const $1 = subscribe(filter, { relays })
    const $2 = subscribe(filter, { relays })

    const spy1 = subscribeSpyTo($1)
    const spy2 = subscribeSpyTo($2)
    await spy1.onComplete()
    await spy2.onComplete()
    expect(spy1.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3'])
    expect(spy2.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3'])

    const $3 = subscribe({ kinds: [1], authors: ['1', '2', '3', '4'] }, { relays })
    const spy3 = subscribeSpyTo($3)
    await spy3.onComplete()
    await relay1.close()
    await relay2.close()
    await relayOutbox.close()
    expect(spy3.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3', '4'])
    // todo: stub verifyWorker
  })

  test('assert subscription on outbox relays only', async ({ createMockRelay, insertRelayList }) => {
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
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [])

    const $ = subscribe(
      { kinds: [1], authors: ['1'] },
      {
        pubkey,
        permission: WRITE,
        outbox: false,
      },
    )
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay1.close()
    await relay2.close()
    await relay3.close()
    await relayOutbox.close()
    const req = ['REQ', '1', { authors: ['1'], kinds: [1] }]
    const close = ['CLOSE', '1']
    expect(relay1.received).toStrictEqual([req, close])
    expect(relay2.received).toStrictEqual([])
    // outbox relay received no subscriptions
    expect(relay3.received).toStrictEqual([req, close])
  })
})
