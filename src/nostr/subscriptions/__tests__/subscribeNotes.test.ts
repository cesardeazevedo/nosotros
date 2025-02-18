import { RELAY_1 } from '@/constants/testRelays'
import * as module from '@/stores/helpers/addNostrEventToStore'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { Kind } from 'constants/kinds'
import { fakeEvent } from 'utils/faker'
import { test } from 'utils/fixtures'
import { vi } from 'vitest'
import { subscribeNotesWithParent } from '../subscribeNotes'

describe('subscribeNotes', () => {
  test('assert parent event and quotes', async ({ createMockRelay, createContext }) => {
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

    const eventSpy = vi.spyOn(module, 'addNostrEventToStore')
    const client = createContext({ relays: [RELAY_1], settings: { outbox: false } })

    const filter = { kinds: [Kind.Text], authors: ['1', '2'] }
    const spy = subscribeSpyTo(subscribeNotesWithParent(filter, client))
    await spy.onComplete()
    await relay.close()

    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1', '2'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0, 10002], authors: ['1', '2'] }, { ids: ['3', '22'] }],
      ['CLOSE', '2'],
      ['REQ', '3', { ids: ['4', '23'] }, { kinds: [0, 10002], authors: ['3', '10'] }],
      ['CLOSE', '3'],
      ['REQ', '4', { kinds: [0, 10002], authors: ['4', '11'] }],
      ['CLOSE', '4'],
    ])

    // The pipeline successfully returned all the related notes
    expect(eventSpy.mock.calls.flatMap((x) => x[0].id)).toStrictEqual(['1', '2', '3', '22', '4', '23'])
    // Only note 1 and 3 are included in the stream
    expect(spy.getValues().map((x) => x.id)).toStrictEqual(['1', '3'])
  })
})
