import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, RELAY_5 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'

describe('NostrContext', () => {
  test('assert pubkey outbox and inbox relays', async ({ createContext, insertRelayList }) => {
    const pubkey = '1'
    await insertRelayList({
      pubkey,
      tags: [
        ['r', RELAY_1],
        ['r', RELAY_2],
        ['r', RELAY_3, 'read'],
        ['r', RELAY_4, 'write'],
        ['r', RELAY_5],
      ],
    })
    const ctx = createContext({ pubkey })
    const outboxSpy = subscribeSpyTo(ctx.outbox$)
    await outboxSpy.onComplete()
    expect(outboxSpy.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_4, RELAY_5]])

    const inboxSpy = subscribeSpyTo(ctx.inbox$)
    await inboxSpy.onComplete()
    expect(inboxSpy.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_3, RELAY_5]])
  })
})
