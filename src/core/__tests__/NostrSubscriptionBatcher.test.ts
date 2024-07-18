import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { RelayFilters } from 'core/NostrSubscription'
import { NostrSubscription } from 'core/NostrSubscription'
import { NostrSubscriptionBatcher } from 'core/NostrSubscriptionBatcher'
import { start } from 'core/operators/start'
import { Pool } from 'core/pool'
import type { NostrFilter } from 'core/types'
import { parseUser } from 'nostr/nips/nip01/metadata/parseUser'
import { from, of } from 'rxjs'
import { fakeUser } from 'utils/faker'
import { RELAY_1, RELAY_2, RELAY_3, test } from 'utils/fixtures'
import { expectRelayReceived, relaySendEose, relaySendEvents } from 'utils/testHelpers'

describe('NostrSubscriptionBatcher', () => {
  test('Assert batched subscriptions events and their respective relays', async ({ relay, relay2, relay3 }) => {
    const user1 = parseUser(fakeUser('1'))
    const user2 = parseUser(fakeUser('2'))
    const user4 = parseUser(fakeUser('4'))
    const user5 = parseUser(fakeUser('5'))

    const pool = new Pool()
    const batcher = new NostrSubscriptionBatcher({
      outbox: (filters: NostrFilter[]) => {
        return from<RelayFilters[]>([
          [RELAY_2, [{ ...filters[0], authors: ['4'] }]],
          [RELAY_3, [{ ...filters[0], authors: ['5'] }]],
        ])
      },
      subscribe: (sub) => {
        return of(sub).pipe(start(pool))
      },
    })

    const relays = of([RELAY_1])
    const sub1 = new NostrSubscription({ kinds: [0], authors: ['1'] }, { relays })
    const sub2 = new NostrSubscription({ kinds: [0], authors: ['2'] }, { relays })
    const sub3 = new NostrSubscription({ kinds: [0], authors: ['3'] }, { relays })
    const sub4 = new NostrSubscription({ kinds: [0], authors: ['4', '5'] }, { relays })

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

  test('send an empty subscription to the batcher and completes immediately', async () => {
    const pool = new Pool()
    const batcher = new NostrSubscriptionBatcher({
      subscribe: (sub) => {
        return pool.subscribe(sub)
      },
    })

    const relays = of([RELAY_1])
    const sub1 = new NostrSubscription({ kinds: [0], authors: [] }, { relays })

    const $1 = of(sub1).pipe(batcher.subscribe())
    const spy1 = subscribeSpyTo($1)

    await spy1.onComplete()
    expect(spy1.getValues()).toStrictEqual([])
  })
})
