import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import { WRITE } from '@/nostr/types'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeNotesWithRelated } from '../subscribeNotes'
import { subscribeThreads } from '../subscribeThreads'

describe('subscribeThreads', () => {
  test('assert root notes ctx', async ({ createMockRelay, createNote, insertRelayList }) => {
    const pubkey1 = 'p1'
    const pubkey2 = 'p2'
    const pubkey3 = 'p3'

    insertRelayList({
      pubkey: pubkey1,
      tags: [
        ['r', RELAY_1, 'write'],
        ['r', RELAY_2, 'read'],
      ],
    })
    insertRelayList({ pubkey: pubkey2, tags: [['r', RELAY_3, 'write']] })
    insertRelayList({ pubkey: pubkey3, tags: [['r', RELAY_3, 'write']] })

    const note1 = createNote({ id: '1', pubkey: 'p1', tags: [] })
    const note2 = createNote({
      id: '2',
      pubkey: pubkey2,
      tags: [
        ['e', '1', '', 'root'],
        ['p', 'p1'],
      ],
    })
    const note3 = createNote({
      id: '3',
      pubkey: pubkey3,
      tags: [
        ['e', '1', '', 'root', 'p1'],
        ['e', '2', '', 'reply', 'p2'],
        ['p', 'p2'],
        ['p', 'p1'],
      ],
    })

    const relay = createMockRelay(RELAY_1, [note1.eventNote])
    const relay2 = createMockRelay(RELAY_2, [note2.eventNote])
    const relay3 = createMockRelay(RELAY_3, [note3.eventNote])

    const ctx = { pubkey: pubkey3, permission: WRITE }
    const $ = subscribeNotesWithRelated({ authors: ['p3'] }, ctx).pipe(subscribeThreads(ctx))
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay.close()
    await relay2.close()
    await relay3.close()

    expect(relay3.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['p3'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0], authors: ['p3', 'p2'] }],
      ['CLOSE', '2'],
    ])
    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], ids: ['1'] }, { kinds: [0], authors: ['p1'] }],
      ['CLOSE', '1'],
    ])
    expect(relay2.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], '#e': ['1'] }],
      ['CLOSE', '1'],
    ])
  })
})
