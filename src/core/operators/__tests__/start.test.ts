import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from '@/constants/testRelays'
import { NostrSubscriptionBuilder } from '@/core/NostrSubscriptionBuilder'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { Pool } from 'core/pool'
import { of } from 'rxjs'
import { fakeEvent } from 'utils/faker'
import { start } from '../start'

describe('start', () => {
  test('assert fixed relays and relayHints', async ({ createMockRelay }) => {
    const event1 = fakeEvent({ id: '1', pubkey: '1' })
    const event2 = fakeEvent({ id: '2', pubkey: '2' })
    const event3 = fakeEvent({ id: '3', pubkey: '3' })
    const event4 = fakeEvent({ id: '10', pubkey: '4' })
    const events = [event1, event2, event3, event4]

    const relay1 = createMockRelay(RELAY_1, events)
    const relay2 = createMockRelay(RELAY_2, events)
    const relay3 = createMockRelay(RELAY_3, events)

    const pool = new Pool()
    const filter = { kinds: [1], authors: ['1', '2', '3'] }
    const sub = new NostrSubscriptionBuilder({
      filter,
      relays: [RELAY_1, RELAY_2], // fixed relays
      relayHints: {
        authors: { '1': [RELAY_3] },
      },
    })

    const $ = of(sub).pipe(start(pool))
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay1.close()
    await relay2.close()
    await relay3.close()

    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1', '2', '3'] }],
      ['CLOSE', '1'],
    ])
    expect(relay2.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1', '2', '3'] }],
      ['CLOSE', '1'],
    ])
    expect(relay3.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1'] }],
      ['CLOSE', '1'],
    ])

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, event1],
      [RELAY_1, event2],
      [RELAY_1, event3],
      [RELAY_2, event1],
      [RELAY_2, event2],
      [RELAY_2, event3],
      [RELAY_3, event1],
    ])
  })
})
