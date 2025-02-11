import { RELAY_1, RELAY_2 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribe } from '../subscribe'

describe('Nostrctx', () => {
  test('assert events from server and cache', async ({ createMockRelay, createContext }) => {
    const ctx = createContext({ settings: { outbox: false } })
    const events = [
      fakeEvent({ id: '1', pubkey: '1', created_at: 1 }),
      fakeEvent({ id: '2', pubkey: '2', created_at: 2 }),
      fakeEvent({ id: '3', pubkey: '3', created_at: 3 }),
      fakeEvent({ id: '4', pubkey: '4', created_at: 4 }),
    ]
    createMockRelay(RELAY_1, events)
    createMockRelay(RELAY_2, events)

    const filter = { kinds: [1], authors: ['1', '2', '3'] }
    const relays = [RELAY_1, RELAY_2]

    const $1 = subscribe(filter, { ...ctx, relays })
    const $2 = subscribe(filter, { ...ctx, relays })

    const spy1 = subscribeSpyTo($1)
    const spy2 = subscribeSpyTo($2)
    await spy1.onComplete()
    await spy2.onComplete()
    expect(spy1.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3'])
    expect(spy2.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3'])

    const $3 = subscribe({ kinds: [1], authors: ['1', '2', '3', '4'] }, { ...ctx, relays })
    const spy3 = subscribeSpyTo($3)
    await spy3.onComplete()
    expect(spy3.getValues().map((x) => x.id)).toStrictEqual(['1', '2', '3', '4'])
    // todo: stub verifyWorker
  })
})
