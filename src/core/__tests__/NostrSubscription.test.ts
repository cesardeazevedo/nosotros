import { subscribeSpyTo } from "@hirez_io/observer-spy"
import { NostrSubscription } from "core/NostrSubscription"
import { start } from "core/operators/start"
import { Pool } from "core/pool"
import type { RelayHints } from "core/types"
import { of } from "rxjs"
import { fakeUser } from "utils/faker"
import { RELAY_1, RELAY_2, RELAY_3, test } from "utils/fixtures"
import { expectRelayReceived, relaySendEose, relaySendEvents } from "utils/testHelpers"

describe('NostrSubscription', () => {
  test('Assert fixed relays, relayHints', async ({ relay, relay2, relay3 }) => {
    const relays = of([RELAY_1, RELAY_2])
    const relayHints = { authors: { '1': [RELAY_3] } } as RelayHints
    const filters = { kinds: [0], authors: ['1', '2', '3'] }
    const pool = new Pool()
    const sub = new NostrSubscription(filters, { relays, relayHints })
    // RELAY_1 => ['REQ', <id>, { kinds: [0], authors: ['1', '2', '3'] }]
    // RELAY_2 => ['REQ', <id>, { kinds: [0], authors: ['1', '2', '3'] }]
    // RELAY_3 => ['REQ', <id>, { kinds: [0], authors: ['1'] }]

    const $ = of(sub).pipe(start(pool))
    const spy = subscribeSpyTo($)

    await expectRelayReceived(relay, filters)
    await expectRelayReceived(relay2, filters)
    await expectRelayReceived(relay3, { kinds: [0], authors: ['1'] }) // hint server

    const event1 = fakeUser('1', { name: 'user' })
    const event2 = fakeUser('1', { name: 'user_updated' })
    const event3 = fakeUser('2', { name: 'user2' })

    relaySendEvents(relay, sub.id, [event1])
    relaySendEose(relay, sub.id)

    relaySendEvents(relay2, sub.id, [event2])
    relaySendEose(relay2, sub.id)

    relaySendEvents(relay3, sub.id, [event3])
    relaySendEose(relay3, sub.id)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, event1],
      [RELAY_2, event2],
      [RELAY_3, event3],
    ])
  })
})
