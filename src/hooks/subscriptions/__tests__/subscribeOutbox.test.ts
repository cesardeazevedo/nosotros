import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_FALLBACK_1, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeOutbox } from '../subscribeOutbox'

describe('subscribeOutbox', () => {
  test('assert author write relays', async ({ createMockRelay }) => {
    const pubkey = 'p1'
    const filter: NostrFilter = { kinds: [Kind.Metadata], authors: [pubkey] }
    const ctx = {} as NostrContext

    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({
        kind: Kind.RelayList,
        content: '',
        created_at: 1,
        pubkey,
        tags: [
          ['r', RELAY_1],
          ['r', RELAY_2, 'write'],
        ],
      }),
    ])
    const $ = subscribeOutbox(filter, ctx)
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relayOutbox.close()
    expect(spy.getValues()).toStrictEqual([
      [
        'wss://relay1.com',
        {
          authors: ['p1'],
          kinds: [0],
        },
      ],
      [
        'wss://relay2.com',
        {
          authors: ['p1'],
          kinds: [0],
        },
      ],
    ])
  })

  test('assert missing relays from author', async ({ createMockRelay }) => {
    const pubkey = 'p1'
    const filter: NostrFilter = { kinds: [Kind.Metadata], authors: [pubkey] }
    const ctx = {} as NostrContext

    const outbox = createMockRelay(RELAY_OUTBOX_1, [])

    const $ = subscribeOutbox(filter, ctx)
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await outbox.close()

    expect(spy.getValues()).toStrictEqual([[RELAY_FALLBACK_1, { ...filter }]])
  })

  test("assert '#p' routes to READ relays", async ({ createMockRelay }) => {
    const pubkey = 'p2'
    const filter: NostrFilter = { kinds: [Kind.Metadata], '#p': [pubkey] }
    const ctx = {} as NostrContext

    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({
        kind: Kind.RelayList,
        content: '',
        created_at: 1,
        pubkey,
        tags: [
          ['r', RELAY_1, 'write'],
          ['r', RELAY_2, 'read'],
        ],
      }),
    ])

    const $ = subscribeOutbox(filter, ctx)
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relayOutbox.close()

    expect(spy.getValues()).toStrictEqual([[RELAY_2, { ...filter }]])
  })
})
