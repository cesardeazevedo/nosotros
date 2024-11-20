import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { RelayFilters } from 'core/NostrSubscription'
import { NostrSubscription } from 'core/NostrSubscription'
import { NostrSubscriptionBatcher } from 'core/NostrSubscriptionBatcher'
import { start } from 'core/operators/start'
import { Pool } from 'core/pool'
import type { NostrFilter } from 'core/types'
import { from, of } from 'rxjs'
import { fakeUser } from 'utils/faker'
import { test } from 'utils/fixtures'
import { expectRelayReceived, relaySendEose, relaySendEvents } from 'utils/testHelpers'

describe('NostrSubscriptionBatcher', () => {
  test('assert batched subscriptions events and their respective relays', async ({ relay, relay2, relay3 }) => {
    const user1 = fakeUser('1')
    const user2 = fakeUser('2')
    const user4 = fakeUser('4')
    const user5 = fakeUser('5')

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

    const relays = of([RELAY_1])
    const sub1 = new NostrSubscription({ kinds: [0], authors: ['1'] }, { relays, outbox })
    const sub2 = new NostrSubscription({ kinds: [0], authors: ['2'] }, { relays, outbox })
    const sub3 = new NostrSubscription({ kinds: [0], authors: ['3'] }, { relays, outbox })
    const sub4 = new NostrSubscription({ kinds: [0], authors: ['4', '5'] }, { relays, outbox })

    const spy1 = subscribeSpyTo(of(sub1).pipe(batcher.subscribe()))
    const spy2 = subscribeSpyTo(of(sub2).pipe(batcher.subscribe()))
    const spy3 = subscribeSpyTo(of(sub3).pipe(batcher.subscribe()))
    const spy4 = subscribeSpyTo(of(sub4).pipe(batcher.subscribe()))

    const parentId = await expectRelayReceived(relay, { kinds: [0], authors: ['1', '2', '3', '4', '5'] })
    await expectRelayReceived(relay2, { kinds: [0], authors: ['4'] })
    await expectRelayReceived(relay3, { kinds: [0], authors: ['5'] })

    relaySendEvents(relay, parentId, [user1, user2])
    relaySendEose(relay, parentId)

    relaySendEvents(relay2, parentId, [user4])
    relaySendEose(relay2, parentId)

    relaySendEvents(relay3, parentId, [user5])
    relaySendEose(relay3, parentId)

    await spy1.onComplete()
    await spy2.onComplete()
    await spy3.onComplete()
    await spy4.onComplete()

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

  test('assert subscriptions transformers', async ({ relay }) => {
    const pool = new Pool()
    const batcher = new NostrSubscriptionBatcher({
      subscribe: (sub) => {
        return of(sub).pipe(start(pool))
      },
    })

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

    const parentId = await expectRelayReceived(relay, { kinds: [0], authors: ['5'] })
    relaySendEose(relay, parentId)

    await spy1.onComplete()
    await spy2.onComplete()
    await spy3.onComplete()
    await spy4.onComplete()
  })
})
