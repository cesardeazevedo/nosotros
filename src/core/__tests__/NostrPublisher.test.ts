import { RELAY_1, RELAY_2 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { NostrPublisher } from 'core/NostrPublish'
import { of } from 'rxjs'

describe('NostrPublish', () => {
  test('assert relayEvent stream with main event', async ({ signer }) => {
    const event = fakeEvent({ id: '1' })

    const publisher = new NostrPublisher(event, {
      relays: of([RELAY_1, RELAY_2]),
      signer,
    })

    const spy = subscribeSpyTo(publisher.relayEvent)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, event],
      [RELAY_2, event],
    ])
  })

  test('assert relayEvent stream with included events', async () => {
    const event1 = fakeEvent({ id: '1' })
    const event2 = fakeEvent({ id: '2' })

    const publisher = new NostrPublisher(undefined, {
      relays: of([RELAY_1, RELAY_2]),
      include: [event1, event2],
    })

    const spy = subscribeSpyTo(publisher.relayEvent)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, event1],
      [RELAY_2, event1],
      [RELAY_1, event2],
      [RELAY_2, event2],
    ])
  })
})
