import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { NostrSubscription } from 'core/NostrSubscription'
import { Relay } from 'core/Relay'
import { of } from 'rxjs'
import { fakeNote } from 'utils/faker'
import { RELAY_1, test } from 'utils/fixtures'
import { expectRelayReceived, relaySendClose, relaySendEose, relaySendEvents } from 'utils/testHelpers'
import { subscribe } from '../subscribe'

describe('onEvent()', () => {
  test('Assert events received and stream completed after eose', async ({ relay }) => {
    const relay1 = new Relay(RELAY_1)
    const sub = new NostrSubscription({ kinds: [0], authors: ['1'] })

    const $ = of(sub).pipe(subscribe(relay1, sub.filters))

    const spy = subscribeSpyTo($)

    const reqId = await expectRelayReceived(relay, sub.filters[0])
    const note1 = fakeNote({ id: '1', pubkey: '1' })
    const note2 = fakeNote({ id: '2', pubkey: '1' })
    const note3 = fakeNote({ id: '3', pubkey: '1' })

    relaySendEvents(relay, reqId, [note1, note2, note3])
    relaySendEose(relay, reqId)

    await spy.onComplete() // eose

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, note1],
      [RELAY_1, note2],
      [RELAY_1, note3],
    ])
  })

  test('Assert CLOSE message from relay', async ({ relay }) => {
    const relay1 = new Relay(RELAY_1)
    const sub = new NostrSubscription({})

    const $ = of(sub).pipe(subscribe(relay1, sub.filters))

    const spy = subscribeSpyTo($)

    const reqId = await expectRelayReceived(relay)

    relaySendClose(relay, reqId, 'Auth required')
    relaySendEose(relay, reqId)

    await spy.onComplete() // eose

    expect(spy.getValues()).toStrictEqual([])
  })
})
