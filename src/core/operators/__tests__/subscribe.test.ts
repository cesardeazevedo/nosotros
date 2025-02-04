import { RELAY_1 } from '@/constants/testRelays'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { NostrSubscription } from 'core/NostrSubscription'
import { Relay } from 'core/Relay'
import { of } from 'rxjs'
import { fakeEvent } from 'utils/faker'
import { test } from 'utils/fixtures'
import { subscribe } from '../subscribe'

describe('subscribe()', () => {
  test('Assert events received and stream completed after eose', async ({ createMockRelay }) => {
    const note1 = fakeEvent({ id: '1', pubkey: '1' })
    const note2 = fakeEvent({ id: '2', pubkey: '1' })
    const note3 = fakeEvent({ id: '3', pubkey: '1' })
    const relay = createMockRelay(RELAY_1, [note1, note2, note3])

    const relay1 = new Relay(RELAY_1)
    const sub = new NostrSubscription({ kinds: [1], authors: ['1'] })

    const $ = of(sub).pipe(subscribe(relay1))

    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay.close()

    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1'] }],
      ['CLOSE', '1'],
    ])
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, note1],
      [RELAY_1, note2],
      [RELAY_1, note3],
    ])
  })
})
