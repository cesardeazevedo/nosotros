import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { NostrSubscription } from 'core/NostrSubscription'
import { Pool } from 'core/pool'
import { of, Subject, take } from 'rxjs'
import { fakeNote, fakeUser } from 'utils/faker'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, test } from 'utils/fixtures'
import { expectRelayReceived, relaySendEose, relaySendEvents } from 'utils/testHelpers'
import { start } from '../start'

describe('start', () => {
  test('Assert fixed relays, relayHints', async ({ relay, relay2, relay3, relay4 }) => {
    const pool = new Pool()

    const filters = [{ kinds: [0], authors: ['1', '2', '3'] }, { ids: ['10'] }]
    const sub = new NostrSubscription(filters, {
      relays: of([RELAY_1, RELAY_2]),
      relayHints: {
        authors: { '1': [RELAY_3] },
        ids: { '10': [RELAY_4] },
      },
    })
    // RELAY_1 => ['REQ', <id>, { kinds: [0], authors: ['1', '2', '3'] }]
    // RELAY_2 => ['REQ', <id>, { kinds: [0], authors: ['1', '2', '3'] }]
    // RELAY_3 => ['REQ', <id>, { kinds: [0], authors: ['1'] }]
    // RELAY_4 => ['REQ', <id>, { ids: ['10'] }]

    const $ = of(sub).pipe(start(pool))
    const spy = subscribeSpyTo($)

    await expectRelayReceived(relay, ...filters)
    await expectRelayReceived(relay2, ...filters)
    await expectRelayReceived(relay3, { kinds: [0], authors: ['1'] }) // hint server
    await expectRelayReceived(relay4, { ids: ['10'] }) // hint id server

    const event1 = fakeUser('1', { name: 'user' })
    const event2 = fakeUser('1', { name: 'user_updated' })
    const event3 = fakeUser('2', { name: 'user2' })
    const event4 = fakeNote({ id: '10' })

    relaySendEvents(relay, sub.id, [event1])
    relaySendEose(relay, sub.id)

    relaySendEvents(relay2, sub.id, [event2])
    relaySendEose(relay2, sub.id)

    relaySendEvents(relay3, sub.id, [event3])
    relaySendEose(relay3, sub.id)

    relaySendEvents(relay4, sub.id, [event4])
    relaySendEose(relay4, sub.id)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, event1],
      [RELAY_2, event2],
      [RELAY_3, event3],
      [RELAY_4, event4],
    ])
  })
  test('start with fixed relays', async ({ relay, relay2 }) => {
    const pool = new Pool()
    const sub = new NostrSubscription(
      {
        kinds: [0],
        authors: ['1'],
      },
      { relays: of([RELAY_1, RELAY_2]) },
    )

    const $ = of(sub).pipe(start(pool))
    const spy = subscribeSpyTo($)

    await expectRelayReceived(relay, sub.filters[0])
    await expectRelayReceived(relay2, sub.filters[0])

    const note1 = fakeNote({ id: '1', pubkey: '1' })
    const note2 = fakeNote({ id: '2', pubkey: '1' })
    const note3 = fakeNote({ id: '3', pubkey: '1' })
    relaySendEvents(relay, sub.id, [note1, note2, note3])
    relaySendEose(relay, sub.id)
    relaySendEvents(relay2, sub.id, [note1, note2])
    relaySendEose(relay2, sub.id)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, note1],
      [RELAY_1, note2],
      [RELAY_1, note3],
      [RELAY_2, note1],
      [RELAY_2, note2],
    ])
  })

  test('start with fixed relays', async ({ relay }) => {
    const pool = new Pool()
    const relays$ = new Subject<string[]>()

    const sub = new NostrSubscription(
      {
        kinds: [0],
        authors: ['1'],
      },
      { relays: relays$.pipe(take(1)) },
    )

    const $ = of(sub).pipe(start(pool))
    const spy = subscribeSpyTo($)

    relays$.next([RELAY_1])

    await expectRelayReceived(relay, sub.filters[0])

    relaySendEose(relay, sub.id)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([])
  })
})
