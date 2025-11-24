import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import { NostrSubscriptionBuilder } from '@/core/NostrSubscriptionBuilder'
import type { NostrFilter } from '@/core/types'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { of } from 'rxjs'
import { fakeEvent, fakeSignature } from 'utils/faker'
import { vi } from 'vitest'
import { start } from '../start'

describe('start', () => {
  test('assert fixed relays and relayHints', async ({ pool, createMockRelay }) => {
    const event1 = fakeEvent({ id: '1', pubkey: '1' })
    const event2 = fakeEvent({ id: '2', pubkey: '2' })
    const event3 = fakeEvent({ id: '3', pubkey: '3' })
    const event4 = fakeEvent({ id: '10', pubkey: '4' })
    const events = [event1, event2, event3, event4]

    const relay1 = createMockRelay(RELAY_1, events)
    const relay2 = createMockRelay(RELAY_2, events)
    const relay3 = createMockRelay(RELAY_3, events)

    const filter = { kinds: [1], authors: ['1', '2', '3'] }
    const sub = new NostrSubscriptionBuilder({
      filter,
      relays: [RELAY_1, RELAY_2], // fixed relays
      relayHints: {
        authors: { '1': [RELAY_3] },
      },
    })

    const $ = of(sub).pipe(start(pool))
    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay1.close()
    await relay2.close()
    await relay3.close()

    expect(relay1.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1', '2', '3'] }],
      ['CLOSE', '1'],
    ])
    expect(relay2.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1', '2', '3'] }],
      ['CLOSE', '1'],
    ])
    expect(relay3.received).toStrictEqual([
      ['REQ', '1', { kinds: [1], authors: ['1'] }],
      ['CLOSE', '1'],
    ])

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, event1],
      [RELAY_1, event2],
      [RELAY_1, event3],
      [RELAY_2, event1],
      [RELAY_2, event2],
      [RELAY_2, event3],
      [RELAY_3, event1],
    ])
  })

  describe('negentropy', () => {
    // // we ideally would use msw but it's conflicting with vite-mock-server
    beforeEach(() => {
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes(RELAY_1.replace('wss://', 'https://'))) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ supported_nips: [77] }),
          })
        }
        return Promise.reject(new Error('Unmocked fetch'))
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
      vi.resetAllMocks()
    })

    test('assert negentropy reconciliation', async ({ pool, createMockRelay }) => {
      const sk = generateSecretKey()
      const pubkey = getPublicKey(sk)
      const event1 = fakeSignature(fakeEvent({ content: '1', created_at: 1 }), sk)
      const event2 = fakeSignature(fakeEvent({ content: '2', created_at: 2 }), sk)
      const event3 = fakeSignature(fakeEvent({ content: '3', created_at: 3 }), sk)
      const event4 = fakeSignature(fakeEvent({ content: '4', created_at: 4 }), sk)

      const relay1 = createMockRelay(RELAY_1, [event1, event2, event3, event4])

      const filter = { kinds: [1], authors: [pubkey] }
      const sub = new NostrSubscriptionBuilder({
        filter,
        relays: [RELAY_1],
        events: new Map([
          [event1.id, { id: event1.id, created_at: event1.created_at }],
          [event2.id, { id: event2.id, created_at: event2.created_at }],
        ]),
        negentropy: true,
      })

      const $ = of(sub).pipe(start(pool))
      const spy = subscribeSpyTo($)

      await spy.onComplete()
      await relay1.close()

      expect(relay1.received).toStrictEqual([
        ['NEG-OPEN', expect.any(String), filter, `6100000202${event1.id}${event2.id}`],
        [
          'REQ',
          '1',
          {
            ids: [
              // assert the missing events
              event3.id,
              event4.id,
            ],
          },
        ],
        ['NEG-CLOSE', expect.any(String)],
        ['CLOSE', '1'],
      ])
      const receivedEvents = spy.getValues().map(([, event]) => event)
      expect(receivedEvents).toHaveLength(2)
      expect(receivedEvents[0]).toMatchObject(event3)
      expect(receivedEvents[1]).toMatchObject(event4)
    })

    test('assert negentropy fully reconciled', async ({ pool, createMockRelay }) => {
      const sk = generateSecretKey()
      const pubkey = getPublicKey(sk)
      const event1 = fakeSignature(fakeEvent({ content: '1', created_at: 1 }), sk)
      const relay1 = createMockRelay(RELAY_1, [event1])

      const filter = { kinds: [1], authors: [pubkey] }
      const sub = new NostrSubscriptionBuilder({
        filter,
        relays: [RELAY_1],
        events: new Map([[event1.id, { id: event1.id, created_at: event1.created_at }]]),
        negentropy: true,
      })

      const $ = of(sub).pipe(start(pool))
      const spy = subscribeSpyTo($)
      await spy.onComplete()
      await relay1.close()

      expect(relay1.received).toStrictEqual([
        ['NEG-OPEN', expect.any(String), filter, `6100000201${event1.id}`],
        ['NEG-CLOSE', expect.any(String)],
      ])

      expect(spy.getValues()).toHaveLength(0)
    })

    test('assert negentropy multiple rounds', async ({ pool, createMockRelay }) => {
      const sk = generateSecretKey()
      const pubkey = getPublicKey(sk)

      const events = Array.from({ length: 1000 }, (_, i) =>
        fakeSignature(fakeEvent({ content: `${i}`, created_at: i + 1 }), sk),
      )

      const relay1 = createMockRelay(RELAY_1, events, { frameSizeLimit: 4096 })

      const existingEvents = new Map(events.slice(0, 500).map((e) => [e.id, { id: e.id, created_at: e.created_at }]))

      const filter = { kinds: [1], authors: [pubkey] }
      const sub = new NostrSubscriptionBuilder({
        filter: { kinds: [1], authors: [pubkey] },
        relays: [RELAY_1],
        events: existingEvents,
        negentropy: true,
      })

      const $ = of(sub).pipe(start(pool))
      const spy = subscribeSpyTo($)
      await spy.onComplete()
      await relay1.close()

      expect(relay1.received[0][0]).toBe('NEG-OPEN')

      const negMsgMessages = relay1.received.filter(([verb]) => verb === 'NEG-MSG')
      expect(negMsgMessages.length).toBe(5)

      const reqMessage = relay1.received.find(([verb]) => verb === 'REQ')
      expect(reqMessage).toBeDefined()

      const reqFilter = reqMessage![2] as NostrFilter
      expect(reqFilter.ids).toHaveLength(500)

      const missingEventIds = events
        .slice(500)
        .map((e) => e.id)
        .sort()
      expect(reqFilter.ids!.sort()).toEqual(missingEventIds)

      expect(relay1.received[relay1.received.length - 2][0]).toBe('NEG-CLOSE')
      expect(relay1.received[relay1.received.length - 1][0]).toBe('CLOSE')

      const receivedEvents = spy.getValues().map(([, event]) => event)
      expect(receivedEvents).toHaveLength(500)
      expect(receivedEvents.map((e) => e.id).sort()).toEqual(missingEventIds)

      expect(relay1.received).toEqual([
        ['NEG-OPEN', expect.any(String), filter, expect.any(String)],
        ['NEG-MSG', expect.any(String), expect.any(String)],
        ['NEG-MSG', expect.any(String), expect.any(String)],
        ['NEG-MSG', expect.any(String), expect.any(String)],
        ['NEG-MSG', expect.any(String), expect.any(String)],
        ['NEG-MSG', expect.any(String), expect.any(String)],
        ['REQ', expect.any(String), { ids: expect.any(Array) }],
        ['NEG-CLOSE', expect.any(String)],
        ['CLOSE', expect.any(String)],
      ])
    })
  })
})
