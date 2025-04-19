import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { db } from '@/nostr/db'
import { updateRelayStats$ } from '@/nostr/db/queryRelayStats'
import { subscribeMailbox, toArrayRelay } from '@/nostr/subscriptions/subscribeMailbox'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { READ, WRITE } from '../../helpers/parseRelayList'

describe('subscribeMailbox', () => {
  test('assert user relays', async ({ createMockRelay }) => {
    const relay = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({
        kind: 10002,
        id: '1',
        pubkey: '1',
        tags: [
          ['r', RELAY_1],
          ['r', RELAY_2, 'read'],
          ['r', RELAY_3, 'write'],
        ],
      }),
    ])
    const read$ = subscribeMailbox('1', { permission: READ }).pipe(toArrayRelay)
    const write$ = subscribeMailbox('1', { permission: WRITE }).pipe(toArrayRelay)
    const both$ = subscribeMailbox('1', { permission: READ | WRITE }).pipe(toArrayRelay)
    const read = subscribeSpyTo(read$)
    const write = subscribeSpyTo(write$)
    const both = subscribeSpyTo(both$)

    await read.onComplete()
    await write.onComplete()
    await both.onComplete()
    await relay.close()

    expect(read.getValues()).toStrictEqual([[RELAY_1, RELAY_2]])
    expect(write.getValues()).toStrictEqual([[RELAY_1, RELAY_3]])
    expect(both.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_3]])
  })

  test('assert relay selection from relay stats', async ({ createMockRelay, insertRelayStats }) => {
    const relay = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({
        kind: 10002,
        id: '1000',
        pubkey: '1',
        tags: [
          ['r', RELAY_1],
          ['r', RELAY_2, 'read'],
          ['r', RELAY_3, 'write'],
          ['r', RELAY_4],
        ],
      }),
    ])

    await insertRelayStats(RELAY_3, { events: 1 })
    await insertRelayStats(RELAY_4, { events: 2 })
    await updateRelayStats$()
    expect(await db.relayStats.queryAll()).toHaveLength(2)

    const $ = subscribeMailbox('1', { permission: READ | WRITE, maxRelaysPerUser: 2 })
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay.close()

    expect(spy.getValues()).toStrictEqual([
      [
        { pubkey: '1', relay: RELAY_4, permission: READ | WRITE },
        { pubkey: '1', relay: RELAY_3, permission: WRITE },
      ],
    ])
  })
})
