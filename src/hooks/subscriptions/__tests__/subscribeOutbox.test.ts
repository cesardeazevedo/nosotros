import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_FALLBACK_1, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import type { RelayServer } from '@/utils/testHelpers'
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
        RELAY_1,
        {
          authors: ['p1'],
          kinds: [0],
        },
      ],
      [
        RELAY_2,
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

  async function assertField(field: '#p' | '#P', createMockRelay: (relayUrl: string, events: ReturnType<typeof fakeEvent>[]) => RelayServer) {
    const pubkey = 'p1' as string
    const filter = { kinds: [Kind.Metadata], [field]: [pubkey] } as NostrFilter
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
  }

  test("assert '#p' routes to READ relays", async ({ createMockRelay }) => {
    await assertField('#p', createMockRelay)
  })

  test("assert '#P' routes to READ relays", async ({ createMockRelay }) => {
    await assertField('#P', createMockRelay)
  })

  // assert tags ids
  async function testTagIds(tag: Record<string, string[]>, createMockRelay: (relayUrl: string, events: ReturnType<typeof fakeEvent>[]) => RelayServer) {
    const pubkey = 'p2'
    const filter: NostrFilter = { kinds: [Kind.Metadata], ...tag }
    const ctx = {
      relayHints: {
        idHints: Object.values(tag).flat().reduce((acc, id) => {
          return { ...acc, [id]: [pubkey] }
        }, {})
      }
    } as NostrContext

    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({
        kind: Kind.RelayList,
        content: '',
        created_at: 1,
        pubkey,
        tags: [
          ['r', RELAY_1, 'write'],
          ['r', RELAY_3, 'read'],
        ],
      }),
    ])

    const $ = subscribeOutbox(filter, ctx)
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relayOutbox.close()

    expect(spy.getValues()).toStrictEqual([[RELAY_3, { ...filter }]])
  }

  test("assert #a tags to READ relays", async ({ createMockRelay }) => {
    await testTagIds({ '#a': ['30023:p2:123'] }, createMockRelay)
  })

  test("assert #e tags to READ relays", async ({ createMockRelay }) => {
    await testTagIds({ '#e': ['e1'] }, createMockRelay)
  })

  test("assert #E tags to READ relays", async ({ createMockRelay }) => {
    await testTagIds({ '#E': ['E1'] }, createMockRelay)
  })

  test("assert #A tags to READ relays", async ({ createMockRelay }) => {
    await testTagIds({ '#A': ['30023:p2:123'] }, createMockRelay)
  })
})
