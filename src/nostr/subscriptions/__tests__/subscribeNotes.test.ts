import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import * as module from '@/stores/helpers/addNostrEventToStore'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { vi } from 'vitest'
import { subscribeNotes, subscribeNotesWithParent, subscribeNotesWithRelated } from '../subscribeNotes'

describe('subscribeNotes', () => {
  test.only('subscribeNotes', async ({ createMockRelay }) => {
    const relay = createMockRelay(RELAY_1, [fakeEvent({ id: '1', pubkey: 'p1' })])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [])
    const spy = subscribeSpyTo(subscribeNotes({ authors: ['p1'] }, { relays: [RELAY_1] }).pipe())
    await spy.onComplete()
    await relay.close()
    await relayOutbox.close()
    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['p1'] }],
      ['CLOSE', '1'],
    ])
  })

  test('subscribeNotesWithParent', async ({ createMockRelay }) => {
    const event1 = fakeEvent({ id: '1', pubkey: '1', tags: [] })
    const event2 = fakeEvent({
      id: '2',
      pubkey: '2',
      tags: [
        ['e', '3', '', 'reply'],
        ['e', '22', '', 'mention'],
      ],
    })
    const event3 = fakeEvent({
      id: '3',
      pubkey: '3',
      tags: [
        ['e', '4', '', 'reply'],
        ['e', '23', '', 'mention'],
      ],
    })
    const event4 = fakeEvent({ id: '4', pubkey: '4', tags: [['e', '5', '', 'reply']] })
    const event5 = fakeEvent({ id: '5', pubkey: '5', tags: [['e', '6', '', 'reply']] })
    const event6 = fakeEvent({ id: '6', pubkey: '6', tags: [['e', '7', '', 'reply']] })
    const event7 = fakeEvent({ id: '22', pubkey: '10' })
    const event8 = fakeEvent({ id: '23', pubkey: '11' })

    const relay = createMockRelay(RELAY_1, [event1, event2, event3, event4, event5, event6, event7, event8])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [])

    const eventSpy = vi.spyOn(module, 'addNostrEventToStore')

    const filter = { kinds: [Kind.Text], authors: ['1', '2'] }
    const spy = subscribeSpyTo(subscribeNotesWithParent(filter, { relays: [RELAY_1] }))
    await spy.onComplete()
    await relay.close()
    await relayOutbox.close()

    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1', '2'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0], authors: ['1', '2'] }, { ids: ['3', '22'] }],
      ['CLOSE', '2'],
      ['REQ', '3', { ids: ['4', '23'] }, { kinds: [0], authors: ['3', '10'] }],
      ['CLOSE', '3'],
      ['REQ', '4', { kinds: [0], authors: ['4', '11'] }],
      ['CLOSE', '4'],
    ])

    // The pipeline successfully returned all the related notes
    expect(eventSpy.mock.calls.flatMap((x) => x[0].id)).toStrictEqual(['1', '2', '3', '22', '4', '23'])
    // Only note 1 and 3 are included in the stream
    expect(spy.getValues().map((x) => x.id)).toStrictEqual(['1', '3'])
  })

  test('subscribeNotesWithRelated', async ({ createMockRelay, insertRelayList }) => {
    const relay1 = createMockRelay(RELAY_1, [
      fakeEvent({ id: '1', pubkey: '1' }),
      fakeEvent({ id: '2', pubkey: '2' }),
      fakeEvent({ id: '3', pubkey: '3' }),
    ])
    const relay2 = createMockRelay(RELAY_2, [])
    const relay3 = createMockRelay(RELAY_3, [])
    const relay4 = createMockRelay(RELAY_4, [])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [])
    await insertRelayList({ pubkey: '1', tags: [['r', RELAY_2, 'write']] })
    await insertRelayList({ pubkey: '2', tags: [['r', RELAY_3, 'write']] })
    await insertRelayList({ pubkey: '3', tags: [['r', RELAY_4, 'write']] })

    const $ = subscribeNotesWithRelated({ authors: ['1', '2', '3'] }, { relays: [RELAY_1], outbox: true })
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay1.close()
    await relayOutbox.close()

    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1', '2', '3'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0], authors: ['1', '2', '3'] }],
      ['CLOSE', '2'],
    ])
    expect(relay2.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0], authors: ['1'] }],
      ['CLOSE', '2'],
    ])
    expect(relay3.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['2'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0], authors: ['2'] }],
      ['CLOSE', '2'],
    ])
    expect(relay4.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['3'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0], authors: ['3'] }],
      ['CLOSE', '2'],
    ])
  })
})
