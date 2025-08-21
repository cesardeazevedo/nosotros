import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2 } from '@/constants/testRelays'
import { SubscriptionBatcher } from '@/core/SubscriptionBatcher'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { fakeEvent, fakeEventMeta } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeRemote, subscribeStrategy } from '../subscribeStrategy'

describe('subscribeStrategy', () => {
  test('assert CACHE_ONLY', async ({ insertEvent }) => {
    const pubkey = 'p1'
    const filter: NostrFilter = { kinds: [Kind.Text], authors: [pubkey] }
    const ctx = { network: 'CACHE_ONLY' } as NostrContext

    const event = fakeEventMeta({ id: '1', kind: Kind.Text, content: 'Hello', pubkey })
    await insertEvent(event)

    const spy = subscribeSpyTo(subscribeStrategy(ctx, filter))
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[event]])
  })

  test('assert CACHE_FIRST_BATCH', async ({ insertEvent, createMockRelay }) => {
    const batcher = new SubscriptionBatcher((filter) => subscribeRemote({ outbox: false, relays: [RELAY_2] }, filter))
    const ctx = { outbox: false, network: 'CACHE_FIRST_BATCH', batcher } as NostrContext

    const event = fakeEventMeta({ id: '1', kind: Kind.RelayList, content: 'Hello', pubkey: 'p1' })
    const event2 = fakeEventMeta({ id: '2', kind: Kind.RelayList, pubkey: 'p2' })
    const event3 = fakeEventMeta({ id: '3', kind: Kind.RelayList, pubkey: 'p3' })
    const event4 = fakeEventMeta({ id: '4', kind: Kind.RelayList, pubkey: 'p4' })
    const event5 = fakeEventMeta({ id: '5', kind: Kind.RelayList, pubkey: 'p5' })
    const event6 = fakeEventMeta({ id: '6', kind: Kind.RelayList, pubkey: 'p6' })

    await insertEvent(event)

    const relay2 = createMockRelay(RELAY_2, [event2, event3, event4, event5, event6])

    const filter: NostrFilter = { kinds: [Kind.RelayList] }
    const spy1 = subscribeSpyTo(subscribeStrategy(ctx, { ...filter, authors: ['p1'] }))
    const spy2 = subscribeSpyTo(subscribeStrategy(ctx, { ...filter, authors: ['p2'] }))
    const spy3 = subscribeSpyTo(subscribeStrategy(ctx, { ...filter, authors: ['p3'] }))
    const spy4 = subscribeSpyTo(subscribeStrategy(ctx, { ...filter, authors: ['p4'] }))
    await spy1.onComplete()
    await spy2.onComplete()
    await spy3.onComplete()
    await spy4.onComplete()

    expect(spy1.getValues()).toStrictEqual([[event]])
    expect(spy2.getValues()).toStrictEqual([[event2]])
    expect(spy3.getValues()).toStrictEqual([[event3]])
    expect(spy4.getValues()).toStrictEqual([[event4]])
    expect(relay2.received).toStrictEqual([
      [
        'REQ',
        '1',
        {
          authors: ['p2', 'p3', 'p4'],
          kinds: [10002],
        },
      ],
      ['CLOSE', '1'],
    ])

    const spy5 = subscribeSpyTo(subscribeStrategy(ctx, { ...filter, authors: ['p5'] }))
    const spy6 = subscribeSpyTo(subscribeStrategy(ctx, { ...filter, authors: ['p6'] }))
    await spy5.onComplete()
    await spy6.onComplete()
    await relay2.close()
    expect(relay2.received).toStrictEqual([
      [
        'REQ',
        '1',
        {
          authors: ['p2', 'p3', 'p4'],
          kinds: [10002],
        },
      ],
      ['CLOSE', '1'],
      [
        'REQ',
        '2',
        {
          authors: ['p5', 'p6'],
          kinds: [10002],
        },
      ],
      ['CLOSE', '2'],
    ])
  })

  test('assert REMOTE_ONLY', async ({ createMockRelay }) => {
    const pubkey = 'p1'
    const filter: NostrFilter = { kinds: [Kind.Text], authors: [pubkey] }
    const ctx = { network: 'REMOTE_ONLY', relays: [RELAY_1] } as NostrContext

    const event1 = fakeEvent({ kind: Kind.Text, pubkey })
    const event1Meta = fakeEventMeta(event1)
    const relay = createMockRelay(RELAY_1, [event1])

    const spy = subscribeSpyTo(subscribeStrategy(ctx, filter))
    await spy.onComplete()
    await relay.close()

    expect(spy.getValues()).toStrictEqual([[event1Meta]])
    expect(relay.received).toStrictEqual([
      [
        'REQ',
        '1',
        {
          authors: ['p1'],
          kinds: [1],
        },
      ],
      ['CLOSE', '1'],
    ])
  })
})
