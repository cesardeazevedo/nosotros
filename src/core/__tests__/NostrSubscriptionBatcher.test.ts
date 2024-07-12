import { subscribeSpyTo } from "@hirez_io/observer-spy"
import { NostrSubscription } from "core/NostrSubscription"
import { NostrSubscriptionBatcher } from "core/NostrSubscriptionBatcher"
import { Pool } from "core/pool"
import { parseUser } from "nostr/nips/nip01/metadata/parseUser"
import { of } from "rxjs"
import { userStore } from "stores/nostr/users.store"
import { fakeUser } from "utils/faker"
import { RELAY_1, test } from "utils/fixtures"
import { expectRelayReceived, relaySendEose, relaySendEvents } from "utils/testHelpers"

describe('NostrSubscriptionBatcher', () => {
  test('send 2 subscriptions to the batcher and assert its events', async ({ relay }) => {
    const user1 = parseUser(fakeUser('1'))
    const user2 = parseUser(fakeUser('2'))

    userStore.add(user1)
    userStore.add(user2)

    const pool = new Pool()
    const batcher = new NostrSubscriptionBatcher({
      subscribe: (sub) => {
        return pool.subscribe(sub)
      }
    })

    const relays = of([RELAY_1])
    const sub1 = new NostrSubscription({ kinds: [0], authors: ['1'] }, { relays })
    const sub2 = new NostrSubscription({ kinds: [0], authors: ['2'] }, { relays })

    const $1 = of(sub1).pipe(batcher.subscribe())
    const $2 = of(sub2).pipe(batcher.subscribe())

    const spy1 = subscribeSpyTo($1)
    const spy2 = subscribeSpyTo($2)

    const reqId = await expectRelayReceived(relay, { kinds: [0], authors: ['1', '2'] })

    relaySendEvents(relay, reqId, [user1, user2])
    relaySendEose(relay, reqId)

    await spy1.onComplete()
    await spy2.onComplete()

    expect(spy1.getValues()).toStrictEqual([[RELAY_1, user1]])
    expect(spy2.getValues()).toStrictEqual([[RELAY_1, user2]])
  })

  test('send an empty subscription to the batcher and completes immediately', async () => {
    const pool = new Pool()
    const batcher = new NostrSubscriptionBatcher({
      subscribe: (sub) => {
        return pool.subscribe(sub)
      }
    })

    const relays = of([RELAY_1])
    const sub1 = new NostrSubscription({ kinds: [0], authors: [] }, { relays })

    const $1 = of(sub1).pipe(batcher.subscribe())
    const spy1 = subscribeSpyTo($1)

    await spy1.onComplete()
    expect(spy1.getValues()).toStrictEqual([])
  })
})
