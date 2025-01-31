import { RELAY_1, RELAY_2 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { of } from 'rxjs'

describe('NostrClient', () => {
  test('assert pubkey outbox and inbox relays', async ({ createClient, insertRelayList }) => {
    const pubkey = '1'
    await insertRelayList({
      pubkey,
      tags: [
        ['r', 'relay1'],
        ['r', 'relay2'],
        ['r', 'relay3', 'read'],
        ['r', 'relay4', 'write'],
        ['r', 'relay5'],
      ],
    })
    const client = createClient({ pubkey })
    const outboxSpy = subscribeSpyTo(client.outbox$)
    await outboxSpy.onComplete()
    expect(outboxSpy.getValues()).toStrictEqual([['relay1', 'relay2', 'relay4', 'relay5']])

    const inboxSpy = subscribeSpyTo(client.inbox$)
    await inboxSpy.onComplete()
    expect(inboxSpy.getValues()).toStrictEqual([['relay1', 'relay2', 'relay3', 'relay5']])
  })

  test('assert events from server and cache', async ({ createMockRelay, createClient }) => {
    const client = createClient({ settings: { outbox: false } })
    const events = [
      fakeEvent({ id: '1', pubkey: '1', created_at: 1 }),
      fakeEvent({ id: '2', pubkey: '2', created_at: 2 }),
      fakeEvent({ id: '3', pubkey: '3', created_at: 3 }),
      fakeEvent({ id: '4', pubkey: '4', created_at: 4 }),
    ]
    createMockRelay(RELAY_1, events)
    createMockRelay(RELAY_2, events)

    const filter = { kinds: [1], authors: ['1', '2', '3'] }
    const relays = of([RELAY_1, RELAY_2])

    const $1 = client.subscribe(filter, { relays })
    const $2 = client.subscribe(filter, { relays })

    const spy1 = subscribeSpyTo($1)
    const spy2 = subscribeSpyTo($2)
    await spy1.onComplete()
    await spy2.onComplete()
    expect(spy1.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3'])
    expect(spy2.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3'])

    const $3 = client.subscribe({ kinds: [1], authors: ['1', '2', '3', '4'] }, { relays })
    const spy3 = subscribeSpyTo($3)
    await spy3.onComplete()
    expect(spy3.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3', '4'])
    // todo: stub verifyWorker
  })
})
