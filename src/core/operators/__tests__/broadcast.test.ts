import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { Kind } from 'constants/kinds'
import { NostrPublisher } from 'core/NostrPublish'
import { Pool } from 'core/pool'
import { of } from 'rxjs'
import { test } from 'utils/fixtures'
import { relaySendEvents, relaySendNotice } from 'utils/testHelpers'
import { broadcast } from '../broadcast'

describe('broadcast', () => {
  test('assert relays responses', async ({ createMockRelay, signer }) => {
    const pool = new Pool()
    const event = fakeEvent({
      id: '1',
      kind: Kind.Text,
      pubkey: '1',
    })

    const publisher = new NostrPublisher(event, {
      relays: of([RELAY_1, RELAY_2, RELAY_3]),
      signer,
    })

    const $ = of(publisher).pipe(broadcast(pool))
    const spy = subscribeSpyTo($)

    const relay = createMockRelay(RELAY_1, [])
    const relay2 = createMockRelay(RELAY_2, [])
    const relay3 = createMockRelay(RELAY_3, [event])

    await spy.onComplete()
    await relay.close()
    await relay2.close()
    await relay3.close()

    expect(relay.received).toStrictEqual([['EVENT', event]])
    expect(relay2.received).toStrictEqual([['EVENT', event]])
    expect(relay3.received).toStrictEqual([['EVENT', event]])

    // Relay sending unrelated messages
    relaySendEvents(relay, '1000', [event])
    relaySendNotice(relay, 'msg')

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, event.id, true, 'status: OK', event],
      [RELAY_2, event.id, true, 'status: OK', event],
      [RELAY_3, event.id, false, 'status: duplicated event', event],
    ])
  })

  test('assert related events being published', async ({ createMockRelay, signer }) => {
    const pool = new Pool()
    const note = fakeEvent({
      id: '1',
      pubkey: '1',
    })

    const reaction = fakeEvent({
      id: '2',
      kind: Kind.Reaction,
      content: '+',
      pubkey: '2',
      tags: [
        ['p', '1'],
        ['e', '1'],
      ],
    })

    const publisher = new NostrPublisher(reaction, {
      relays: of([RELAY_1]),
      include: [note],
      signer,
    })

    const relay = createMockRelay(RELAY_1, [])

    const $ = of(publisher).pipe(broadcast(pool))
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    expect(relay.received).toStrictEqual([
      ['EVENT', reaction],
      ['EVENT', note],
    ])

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, reaction.id, true, 'status: OK', reaction],
      [RELAY_1, note.id, true, 'status: OK', note],
    ])
  })
})
