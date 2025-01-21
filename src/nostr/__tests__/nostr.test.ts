import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'

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
})
