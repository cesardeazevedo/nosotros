import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { parseRepost } from '@/nostr/helpers/parseRepost'
import { metadataSymbol, WRITE } from '@/nostr/types'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeReposts } from '../subscribeReposts'

describe('subscribeReposts', () => {
  test('assert reposted from json content', async ({ createMockRelay, insertRelayList }) => {
    const pubkey = 'p1'
    const pubkey2 = 'p2'

    const event = fakeEvent({
      kind: Kind.Text,
      id: 'e1',
      pubkey: pubkey2,
    })
    const repost = fakeEvent({
      kind: Kind.Repost,
      content: `${JSON.stringify(event)}`,
      id: '1',
      pubkey,
      tags: [],
    })
    const relay = createMockRelay(RELAY_1, [repost])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [])
    await insertRelayList({ pubkey, tags: [['r', RELAY_1, 'write']] })
    const ctx = { pubkey, permission: WRITE }
    const $ = subscribeReposts({ authors: [pubkey] }, ctx)
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay.close()
    await relayOutbox.close()
    expect(spy.getValues()).toStrictEqual([
      {
        ...repost,
        [metadataSymbol]: parseRepost(repost),
      },
    ])
    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [6], authors: [pubkey] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0], authors: [pubkey] }],
      ['CLOSE', '2'],
    ])
  })

  test('assert reposted without the content json', async ({ createMockRelay, insertRelayList }) => {
    const pubkey = 'p1'
    const pubkey2 = 'p2'
    const relay = createMockRelay(RELAY_1, [
      fakeEvent({
        kind: Kind.Repost,
        content: '{}',
        id: '1',
        pubkey,
        tags: [
          ['e', 'e1'],
          ['p', pubkey2],
        ],
      }),
    ])
    const relay2 = createMockRelay(RELAY_3, [
      fakeEvent({
        kind: Kind.Text,
        id: 'e1',
        pubkey: pubkey2,
      }),
    ])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [])
    await insertRelayList({
      pubkey,
      tags: [
        ['r', RELAY_2, 'read'],
        ['r', RELAY_1, 'write'],
      ],
    })
    await insertRelayList({
      pubkey: pubkey2,
      tags: [
        ['r', RELAY_1, 'read'],
        ['r', RELAY_3, 'write'],
      ],
    })

    const ctx = { pubkey, permission: WRITE }
    const $ = subscribeReposts({ authors: [pubkey] }, ctx)
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay.close()
    await relay2.close()
    await relayOutbox.close()
    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [6], authors: [pubkey] }],
      ['CLOSE', '1'],
      ['REQ', '2', { kinds: [0], authors: [pubkey] }],
      ['CLOSE', '2'],
    ])
    expect(relay2.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], ids: ['e1'] }, { kinds: [0], authors: ['p2'] }],
      ['CLOSE', '1'],
    ])
  })
})
