import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { RelayFilters } from 'core/NostrSubscription'
import { NostrSubscription } from 'core/NostrSubscription'
import { NostrSubscriptionBatcher } from 'core/NostrSubscriptionBatcher'
import { start } from 'core/operators/start'
import { Pool } from 'core/pool'
import type { NostrFilter } from 'core/types'
import { from, of } from 'rxjs'
import { fakeEvent } from 'utils/faker'
import { test } from 'utils/fixtures'

describe('NostrSubscriptionBatcher', () => {
  test('assert batched subscriptions events and their respective relays', async ({ createMockRelay }) => {
    const user1 = fakeEvent({ kind: Kind.Metadata, pubkey: '1' })
    const user2 = fakeEvent({ kind: Kind.Metadata, pubkey: '2' })
    const user4 = fakeEvent({ kind: Kind.Metadata, pubkey: '4' })
    const user5 = fakeEvent({ kind: Kind.Metadata, pubkey: '5' })

    const pool = new Pool()
    const outbox = (filters: NostrFilter[]) => {
      return from<RelayFilters[]>([
        [RELAY_2, [{ ...filters[0], authors: ['4'] }]],
        [RELAY_3, [{ ...filters[0], authors: ['5'] }]],
      ])
    }
    const batcher = new NostrSubscriptionBatcher({
      subscribe: (sub) => of(sub).pipe(start(pool)),
    })

    const relay1 = createMockRelay(RELAY_1, [user1, user2])
    const relay2 = createMockRelay(RELAY_2, [user4])
    const relay3 = createMockRelay(RELAY_3, [user5])

    const relays = of([RELAY_1])
    const sub1 = new NostrSubscription({ kinds: [0], authors: ['1'] }, { relays, outbox })
    const sub2 = new NostrSubscription({ kinds: [0], authors: ['2'] }, { relays, outbox })
    const sub3 = new NostrSubscription({ kinds: [0], authors: ['3'] }, { relays, outbox })
    const sub4 = new NostrSubscription({ kinds: [0], authors: ['4', '5'] }, { relays, outbox })

    const spy1 = subscribeSpyTo(of(sub1).pipe(batcher.subscribe()))
    const spy2 = subscribeSpyTo(of(sub2).pipe(batcher.subscribe()))
    const spy3 = subscribeSpyTo(of(sub3).pipe(batcher.subscribe()))
    const spy4 = subscribeSpyTo(of(sub4).pipe(batcher.subscribe()))

    await spy1.onComplete()
    await spy2.onComplete()
    await spy3.onComplete()
    await spy4.onComplete()
    await relay1.close()
    await relay2.close()
    await relay3.close()

    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [0], authors: ['1', '2', '3', '4', '5'] }],
      ['CLOSE', '1'],
    ])
    expect(relay2.received).toStrictEqual([
      ['REQ', '1', { kinds: [0], authors: ['4'] }],
      ['CLOSE', '1'],
    ])
    expect(relay3.received).toStrictEqual([
      ['REQ', '1', { kinds: [0], authors: ['5'] }],
      ['CLOSE', '1'],
    ])

    expect(spy1.getValues()).toStrictEqual([[RELAY_1, user1]])
    expect(spy2.getValues()).toStrictEqual([[RELAY_1, user2]])
    expect(spy4.getValues()).toStrictEqual([
      [RELAY_2, user4],
      [RELAY_3, user5],
    ])
  })

  test('send invalid subscription to the batcher and completes immediately', async () => {
    const pool = new Pool()
    const batcher = new NostrSubscriptionBatcher({
      subscribe: (sub) => {
        return of(sub).pipe(start(pool))
      },
    })

    const relays = of([RELAY_1])
    const sub1 = new NostrSubscription({ kinds: [0], authors: [] }, { relays })

    const $1 = of(sub1).pipe(batcher.subscribe())
    const spy1 = subscribeSpyTo($1)

    await spy1.onComplete()
    expect(spy1.getValues()).toStrictEqual([])
  })

  test('assert subscriptions transformers', async ({ createMockRelay }) => {
    const pool = new Pool()
    const batcher = new NostrSubscriptionBatcher({
      subscribe: (sub) => {
        return of(sub).pipe(start(pool))
      },
    })

    const relay = createMockRelay(RELAY_1, [])
    const cache = new Map()

    const transform = (filters: NostrFilter[]) => {
      return filters.map((filter) => {
        return {
          ...filter,
          authors: filter.authors?.filter((x) => !cache.has(x)) || [],
        }
      })
    }

    const relays = of([RELAY_1])
    const sub1 = new NostrSubscription({ kinds: [0], authors: ['1'] }, { relays, transform })
    const sub2 = new NostrSubscription({ kinds: [0], authors: ['2'] }, { relays, transform })
    const sub3 = new NostrSubscription({ kinds: [0], authors: ['3'] }, { relays, transform })
    const sub4 = new NostrSubscription({ kinds: [0], authors: ['4', '5'] }, { relays, transform })

    const spy1 = subscribeSpyTo(of(sub1).pipe(batcher.subscribe()))
    const spy2 = subscribeSpyTo(of(sub2).pipe(batcher.subscribe()))
    const spy3 = subscribeSpyTo(of(sub3).pipe(batcher.subscribe()))
    const spy4 = subscribeSpyTo(of(sub4).pipe(batcher.subscribe()))

    cache.set('1', true)
    cache.set('2', true)
    cache.set('3', true)
    cache.set('4', true)

    await spy1.onComplete()
    await spy2.onComplete()
    await spy3.onComplete()
    await spy4.onComplete()

    expect(relay.received).toStrictEqual([['REQ', '1', { kinds: [0], authors: ['5'] }]])
  })
})
