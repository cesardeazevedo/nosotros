import { RELAY_1 } from '@/constants/testRelays'
import { Note } from '@/stores/models/note'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { Kind } from 'constants/kinds'
import { fakeNote, fakeUser } from 'utils/faker'
import { test } from 'utils/fixtures'
import { expectRelayReceived, expectRelayReceivedClose, relaySendEose, relaySendEvents } from 'utils/testHelpers'

describe('NIP01Notes', () => {
  test('assert basic subWithRelated', async ({ relay, createClient }) => {
    const client = createClient({ relays: [RELAY_1], settings: { outboxEnabled: false } })

    const filter = { kinds: [Kind.Text, Kind.Article], authors: ['1'] }
    const $ = client.notes.subWithRelated(filter)

    const spy = subscribeSpyTo($)

    const reqId = await expectRelayReceived(relay, { ...filter })

    const event2 = fakeNote({ id: '2', content: 'reply', pubkey: '1', tags: [['e', '1', '', 'root']] })

    relaySendEvents(relay, reqId, [event2])
    relaySendEose(relay, reqId)
    await expectRelayReceivedClose(relay)

    // Assert user requests
    const reqId2 = await expectRelayReceived(
      relay,
      { ids: ['1'] },
      { kinds: [Kind.Metadata, Kind.RelayList], authors: ['1'] },
    )

    const event1 = fakeNote({ id: '1', content: 'root', pubkey: '2', tags: [] })
    relaySendEvents(relay, reqId2, [event1])
    relaySendEose(relay, reqId2)
    await expectRelayReceivedClose(relay)

    const reqId3 = await expectRelayReceived(relay, { kinds: [Kind.Metadata, Kind.RelayList], authors: ['2'] })
    relaySendEose(relay, reqId3)
    await expectRelayReceivedClose(relay)

    // Stream complete after eose
    await spy.onComplete()

    const values = spy.getValues()
    expect(values).toHaveLength(2)
    expect(values[0]).toBeInstanceOf(Note)
    expect(values[0].id).toStrictEqual(event2.id)
    expect(values[1]).toBeInstanceOf(Note)
    expect(values[1].id).toStrictEqual(event1.id)
  })

  test('assert multiple e references', async ({ createClient, relay }) => {
    const client = createClient({ relays: [RELAY_1], settings: { outboxEnabled: false } })
    const filter = { kinds: [Kind.Text, Kind.Article], authors: ['1'] }
    const $ = client.notes.subWithRelated(filter)

    const spy = subscribeSpyTo($)

    const reqId = await expectRelayReceived(relay, { ...filter })

    const event1 = fakeNote({
      pubkey: '1',
      id: '10',
      tags: [
        ['e', '1', '', 'root'],
        ['e', '2', '', 'reply'],
        ['e', '3', '', 'reply'],
        ['e', '4', '', 'reply'],
        ['e', '5', '', 'reply'],
        ['e', '6', '', 'reply'],
        ['e', '7', '', 'reply'],
      ],
    })
    relaySendEvents(relay, reqId, [event1])
    relaySendEose(relay, reqId)
    await expectRelayReceivedClose(relay)
    const reqId2 = await expectRelayReceived(
      relay,
      { ids: ['1', '2', '3', '4', '5', '6', '7'] },
      { kinds: [Kind.Metadata, Kind.RelayList], authors: ['1'] },
    )
    relaySendEvents(relay, reqId2, [
      fakeNote({ id: '2', pubkey: '1', tags: [['e', '1', '', 'root']] }),
      fakeNote({ id: '3', pubkey: '1', tags: [['e', '2', '', 'root']] }),
      fakeNote({
        id: '4',
        pubkey: '1',
        tags: [
          ['e', '1', '', 'root'],
          ['e', '3', '', 'reply'],
        ],
      }),
      fakeNote({
        id: '5',
        pubkey: '1',
        tags: [
          ['e', '1', '', 'root'],
          ['e', '4', '', 'reply'],
        ],
      }),
      fakeNote({
        id: '6',
        pubkey: '1',
        tags: [
          ['e', '1', '', 'root'],
          ['e', '5', '', 'reply'],
        ],
      }),
      fakeNote({
        id: '7',
        pubkey: '1',
        tags: [
          ['e', '1', '', 'root'],
          ['e', '6', '', 'reply'],
        ],
      }),
      fakeUser('1', { name: 'user' }),
    ])
    relaySendEose(relay, reqId2)
    await expectRelayReceivedClose(relay)
    const reqId3 = await expectRelayReceived(relay, { ids: ['1'] })
    relaySendEvents(relay, reqId3, [fakeNote({ id: '1', pubkey: '1' })])
    relaySendEose(relay, reqId3)
    await expectRelayReceivedClose(relay)
    await spy.onComplete()
    const values = spy.getValues()
    expect(values.map((x) => x.event.id)).toStrictEqual(['10', '2', '3', '4', '5', '6', '7', '1'])
  })

  test('assert multiple mention quote notes', async ({ createClient, relay }) => {
    const client = createClient({ relays: [RELAY_1], settings: { outboxEnabled: false } })

    const filter = { kinds: [Kind.Text, Kind.Article], authors: ['1'] }
    const $ = client.notes.subWithRelated(filter)
    const spy = subscribeSpyTo($)

    const reqId = await expectRelayReceived(relay, { ...filter })

    const event1 = fakeNote({
      pubkey: '1',
      id: '1',
      tags: [
        ['e', '2', '', 'root'],
        ['q', '3'],
        ['e', '4', '', 'mention'],
        ['e', '5'],
        ['e', '6'],
      ],
    })
    const user1 = fakeUser('1', { name: 'user' })
    relaySendEvents(relay, reqId, [event1, user1])
    relaySendEvents(relay, reqId, [event1])
    relaySendEose(relay, reqId)
    await expectRelayReceivedClose(relay)
    const reqId2 = await expectRelayReceived(
      relay,
      { ids: ['2', '5', '6', '4', '3'] },
      { kinds: [Kind.Metadata, Kind.RelayList], authors: ['1'] },
    )
    relaySendEvents(relay, reqId2, [
      fakeNote({ id: '2', pubkey: '1' }),
      fakeNote({ id: '5', pubkey: '1' }),
      fakeNote({ id: '6', pubkey: '1' }),
      fakeNote({ id: '4', pubkey: '1' }),
      fakeNote({ id: '3', pubkey: '1' }),
      fakeUser('1', { name: 'user' }),
    ])
    relaySendEose(relay, reqId2)
    await spy.onComplete()
    const values = spy.getValues()
    // quotes 4 and 3 were out of the stream
    expect(values.map((x) => x.event.id)).toStrictEqual(['1', '2', '5', '6'])
  })
})
