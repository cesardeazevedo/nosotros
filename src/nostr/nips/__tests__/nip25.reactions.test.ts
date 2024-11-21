import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { fakeNote } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { expectRelayReceived, expectRelayReceivedClose, relaySendEose, relaySendEvents } from '@/utils/testHelpers'
import { subscribeSpyTo } from '@hirez_io/observer-spy'

describe('NIP25', () => {
  test('assert subscription from note lastSyncedAt', async ({ relay, createClient, createNote }) => {
    const client = createClient({ relays: [RELAY_1], settings: { outboxEnabled: false } })
    const note = createNote({ id: '1' })
    const $ = note.subscribeReactions(client)

    const spy = subscribeSpyTo($)
    const reqId = await expectRelayReceived(relay, { kinds: [Kind.Reaction], '#e': ['1'] })

    const event1 = fakeNote({ kind: Kind.Reaction, id: '1', content: '+', created_at: 10, tags: [['e', '1']] })
    const event2 = fakeNote({ kind: Kind.Reaction, id: '2', content: '+', created_at: 11, tags: [['e', '1']] })
    const event3 = fakeNote({ kind: Kind.Reaction, id: '3', content: '+', created_at: 12, tags: [['e', '1']] })

    relaySendEvents(relay, reqId, [event1, event2, event3])
    relaySendEose(relay, reqId)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([event1, event2, event3])

    note.metadata.lastSyncedAt = 12

    const $2 = note.subscribeReactions(client)
    const spy2 = subscribeSpyTo($2)

    await expectRelayReceivedClose(relay)
    const reqId2 = await expectRelayReceived(relay, { kinds: [Kind.Reaction], '#e': ['1'], since: 12 })

    relaySendEose(relay, reqId2)
    await spy2.onComplete()
  })
})
