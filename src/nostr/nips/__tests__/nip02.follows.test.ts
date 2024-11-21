import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { Follows } from '@/stores/models/follow'
import { followsStore } from '@/stores/nostr/follows.store'
import { fakeNote, fakeUser } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { expectRelayReceived, expectRelayReceivedClose, relaySendEose, relaySendEvents } from '@/utils/testHelpers'
import { subscribeSpyTo } from '@hirez_io/observer-spy'

describe('NIP02', () => {
  test('assert subscription', async ({ relay, createClient }) => {
    const client = createClient({ relays: [RELAY_1], settings: { outboxEnabled: false } })
    const $ = client.follows.subscribe('1')

    const spy = subscribeSpyTo($)
    const reqId = await expectRelayReceived(relay, { kinds: [Kind.Follows], authors: ['1'] })

    const followsEvent = fakeNote({
      kind: Kind.Follows,
      id: '1',
      pubkey: '1',
      tags: [
        ['p', '2'],
        ['p', '3'],
      ],
    })
    relaySendEvents(relay, reqId, [followsEvent])
    relaySendEose(relay, reqId)
    await expectRelayReceivedClose(relay)

    const reqId2 = await expectRelayReceived(relay, {
      kinds: [Kind.Metadata, Kind.RelayList],
      authors: ['2', '3'],
    })

    relaySendEvents(relay, reqId2, [
      fakeUser('2'),
      fakeUser('3'),
      fakeNote({ kind: Kind.RelayList, pubkey: '2' }),
      fakeNote({ kind: Kind.RelayList, pubkey: '3' }),
    ])
    relaySendEose(relay, reqId2)
    await expectRelayReceivedClose(relay)
    expect(relay.messages).toHaveLength(4)
    await spy.onComplete()

    const follows = new Follows(followsEvent)
    expect(spy.getValues()).toStrictEqual([follows])
    expect(followsStore.follows.has('2'))

    // Assert cache on second subscription
    const $2 = client.follows.subscribe('1')
    const spy2 = subscribeSpyTo($2)
    await spy2.onComplete()
    expect(relay.messages).toHaveLength(4)
    expect(spy2.getValues()).toStrictEqual([follows])
  })
})
