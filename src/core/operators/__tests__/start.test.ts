import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { NostrSubscription } from 'core/NostrSubscription'
import { Pool } from 'core/pool'
import { from, interval, map, merge, of, zip } from 'rxjs'
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
    const relay4 = createMockRelay(RELAY_4, events)

    const pool = new Pool()
    const filters = [{ kinds: [1], authors: ['1', '2', '3'] }, { ids: ['10'] }]
    const sub = new NostrSubscription(filters, {
      relays: merge(of([RELAY_1, RELAY_2])), // fixed relays
      relayHints: {
        authors: { '1': [RELAY_3] },
        ids: { '10': [RELAY_4] },
      },
    })

    const $ = of(sub).pipe(start(pool))
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay1.close()
    await relay2.close()
    await relay3.close()
    await relay4.close()

    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1', '2', '3'] }, { ids: ['10'] }],
      ['CLOSE', '1'],
    ])
    expect(relay2.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1', '2', '3'] }, { ids: ['10'] }],
      ['CLOSE', '1'],
    ])
    expect(relay3.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1'] }],
      ['CLOSE', '1'],
    ])
    expect(relay4.received).toStrictEqual([
      ['REQ', '1', { ids: ['10'] }],
      ['CLOSE', '1'],
    ])

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, event1],
      [RELAY_1, event2],
      [RELAY_1, event3],
      [RELAY_1, event4],
      [RELAY_2, event1],
      [RELAY_2, event2],
      [RELAY_2, event3],
      [RELAY_2, event4],
      [RELAY_3, event1],
      [RELAY_4, event4],
    ])
  })

  test('assert observable relays', async ({ createMockRelay }) => {
    const relay1 = createMockRelay(RELAY_1, [])
    const relay2 = createMockRelay(RELAY_2, [])
    const relay3 = createMockRelay(RELAY_3, [])
    const relay4 = createMockRelay(RELAY_4, [])

    const pool = new Pool()
    const filters = [{ kinds: [1], authors: ['1', '2', '3'] }, { ids: ['10'] }]

    const sub = new NostrSubscription(filters, {
      relays: zip(from([RELAY_1, RELAY_2]), interval(1000)).pipe(map(([relay]) => [relay])),
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
    await relay4.close()
  })
})
