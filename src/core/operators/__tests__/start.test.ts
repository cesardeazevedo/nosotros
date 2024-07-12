import { subscribeSpyTo } from "@hirez_io/observer-spy"
import { NostrSubscription } from "core/NostrSubscription"
import { Pool } from "core/pool"
import { of, Subject, take } from "rxjs"
import { fakeNote } from "utils/faker"
import { RELAY_1, RELAY_2, test } from "utils/fixtures"
import { expectRelayReceived, relaySendEose, relaySendEvents } from "utils/testHelpers"
import { start } from "../start"

describe('start', () => {
  test('start with fixed relays', async ({ relay, relay2 }) => {
    const pool = new Pool()
    const sub = new NostrSubscription({
      kinds: [0],
      authors: ['1'],
    }, { relays: of([RELAY_1, RELAY_2]) })

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

    const sub = new NostrSubscription({
      kinds: [0],
      authors: ['1'],
    }, { relays: relays$.pipe(take(1)) })

    const $ = of(sub).pipe(start(pool))
    const spy = subscribeSpyTo($)

    relays$.next([RELAY_1])

    await expectRelayReceived(relay, sub.filters[0])

    relaySendEose(relay, sub.id)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([])
  })
})
