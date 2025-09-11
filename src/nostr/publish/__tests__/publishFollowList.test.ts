import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_FALLBACK_1, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { publishFollowList } from '../publishFollowList'

describe('publishFollowList', () => {
  test('assert follow', async ({ createMockRelay, signer }) => {
    const pubkey = 'p1'
    const relay1 = createMockRelay(RELAY_1, [
      fakeEvent({
        kind: Kind.Follows,
        pubkey,
        content: '',
        created_at: 1,
        tags: [
          ['p', 'p2'],
          ['p', 'p3'],
          ['p', 'p4'],
        ],
      }),
    ])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({ kind: Kind.RelayList, pubkey, tags: [['r', RELAY_1, 'write']] }),
    ])
    const relayFallback = createMockRelay(RELAY_FALLBACK_1, [])
    const $ = publishFollowList(pubkey, 'p', ['p5'], { signer })
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay1.close()
    await relayOutbox.close()
    await relayFallback.close()
    const event = {
      kind: 3,
      content: '',
      pubkey,
      tags: [
        ['p', 'p2'],
        ['p', 'p3'],
        ['p', 'p4'],
        ['p', 'p5'],
      ],
      id: expect.any(String),
      sig: expect.any(String),
      created_at: expect.any(Number),
    }
    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [Kind.Follows], authors: [pubkey] }],
      ['CLOSE', '1'],
      ['EVENT', event],
    ])
    expect(relayFallback.received).toStrictEqual([['EVENT', event]])
  })

  test('assert unfollow', async ({ createMockRelay, signer }) => {
    const pubkey = 'p1'
    const relay1 = createMockRelay(RELAY_1, [
      fakeEvent({
        kind: Kind.Follows,
        pubkey,
        content: '',
        created_at: 1,
        tags: [
          ['p', 'p2'],
          ['p', 'p3'],
          ['p', 'p4'],
        ],
      }),
    ])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({ kind: Kind.RelayList, pubkey, tags: [['r', RELAY_1, 'write']] }),
    ])
    const relayFallback = createMockRelay(RELAY_FALLBACK_1, [])
    const $ = publishFollowList(pubkey, 'p', ['p4'], { signer })
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay1.close()
    await relayOutbox.close()
    await relayFallback.close()
    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [Kind.Follows], authors: [pubkey] }],
      ['CLOSE', '1'],
      [
        'EVENT',
        {
          kind: 3,
          content: '',
          pubkey,
          tags: [
            ['p', 'p2'],
            ['p', 'p3'],
          ],
          created_at: expect.any(Number),
          id: expect.any(String),
          sig: expect.any(String),
        },
      ],
    ])
  })

  test('assert bulk follow', async ({ createMockRelay, signer }) => {
    const pubkey = 'p1'
    const relay1 = createMockRelay(RELAY_1, [
      fakeEvent({
        kind: Kind.Follows,
        pubkey,
        content: '',
        created_at: 1,
        tags: [
          ['p', 'p2'],
          ['p', 'p3'],
          ['p', 'p4'],
        ],
      }),
    ])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({ kind: Kind.RelayList, pubkey, tags: [['r', RELAY_1, 'write']] }),
    ])
    const relayFallback = createMockRelay(RELAY_FALLBACK_1, [])
    const $ = publishFollowList(pubkey, 'p', ['p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'], { signer })
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay1.close()
    await relayOutbox.close()
    await relayFallback.close()
    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [Kind.Follows], authors: [pubkey] }],
      ['CLOSE', '1'],
      [
        'EVENT',
        {
          kind: 3,
          content: '',
          pubkey,
          tags: [
            ['p', 'p2'],
            ['p', 'p3'],
            ['p', 'p4'],
            ['p', 'p5'],
            ['p', 'p6'],
            ['p', 'p7'],
            ['p', 'p8'],
          ],
          id: expect.any(String),
          sig: expect.any(String),
          created_at: expect.any(Number),
        },
      ],
    ])
  })
})
