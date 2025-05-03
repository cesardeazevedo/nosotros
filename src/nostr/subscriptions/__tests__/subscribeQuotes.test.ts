import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_FALLBACK_1, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { WRITE } from '@/nostr/types'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeNotes, subscribeNotesWithRelated } from '../subscribeNotes'
import { subscribeQuotes } from '../subscribeQuotes'

describe('subscribeQuotes', () => {
  test('assert quoted author relays ctx', async ({ createMockRelay, createNote }) => {
    const pubkey1 = 'p1'
    const pubkey2 = 'p2'

    const note1 = createNote({ id: '1', pubkey: pubkey1, tags: [['q', 'q1', '', pubkey2]] })
    const note2 = createNote({ id: 'q1', pubkey: pubkey2, tags: [] })

    const relay1 = createMockRelay(RELAY_1, [note1.eventNote])
    const relay2 = createMockRelay(RELAY_2, [note2.eventNote])
    const relayFallback = createMockRelay(RELAY_FALLBACK_1, [])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({ kind: Kind.RelayList, pubkey: pubkey1, tags: [['r', RELAY_1, 'write']] }),
      fakeEvent({ kind: Kind.RelayList, pubkey: pubkey2, tags: [['r', RELAY_2, 'write']] }),
    ])

    const ctx = { pubkey: pubkey1, permission: WRITE }
    const $ = subscribeNotesWithRelated({ authors: [pubkey1] }, ctx).pipe(subscribeQuotes(ctx))
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay1.close()
    await relay2.close()
    await relayOutbox.close()
    await relayFallback.close()

    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: [pubkey1] }],
      ['CLOSE', '1'],
      ['REQ', '2', { ids: ['q1'] }, { kinds: [0], authors: [pubkey1] }],
      ['CLOSE', '2'],
    ])
    expect(relay2.received).toStrictEqual([
      ['REQ', '1', { ids: ['q1'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0], authors: ['p2'] }],
      ['CLOSE', '2'],
    ])
    expect(relayOutbox.received).toStrictEqual([
      ['REQ', '1', { kinds: [10002], authors: ['p1'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [10002], authors: ['p2'] }],
      ['CLOSE', '2'],
    ])
  })

  test('Assert note1 note without relays', async ({ createMockRelay, createNote }) => {
    const pubkey1 = 'p1'
    const pubkey2 = 'p2'

    const note1 = createNote({
      id: '1',
      pubkey: pubkey1,
      content: 'nostr:note1yrays7460p7wc4qw0w3aqgswh3xrau3xgv36tu6rmjhrvd45rm8symu6tg',
      tags: [['p', pubkey2]],
    })

    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({ id: '10', kind: Kind.RelayList, pubkey: pubkey1, tags: [['r', RELAY_1, 'write']] }),
      fakeEvent({ id: '11', kind: Kind.RelayList, pubkey: pubkey2, tags: [['r', RELAY_2, 'write']] }),
    ])
    const relay1 = createMockRelay(RELAY_1, [note1.eventNote])
    const relay2 = createMockRelay(RELAY_2, [])
    const relayFallback = createMockRelay(RELAY_FALLBACK_1, [])

    const ctx = { pubkey: pubkey1, permission: WRITE }
    const $ = subscribeNotes({ authors: [pubkey1] }, ctx).pipe(subscribeQuotes(ctx))
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay1.close()
    await relay2.close()
    await relayOutbox.close()
    await relayFallback.close()

    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['p1'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { ids: ['20fa487aba787cec540e7ba3d0220ebc4c3ef2264323a5f343dcae3636b41ecf'] }],
      ['CLOSE', '2'],
    ])
    expect(relay2.received).toStrictEqual([
      ['REQ', '1', { ids: ['20fa487aba787cec540e7ba3d0220ebc4c3ef2264323a5f343dcae3636b41ecf'] }],
      ['CLOSE', '1'],
    ])
    expect(relayOutbox.received).toStrictEqual([
      ['REQ', '1', { kinds: [10002], authors: ['p1'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [10002], authors: ['p2'] }],
      ['CLOSE', '2'],
    ])
  })
})
