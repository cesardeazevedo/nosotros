import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { RelayFilters } from 'core/NostrSubscription'
import { NostrSubscription } from 'core/NostrSubscription'
import { from, merge, of } from 'rxjs'

describe('NostrSubscription', () => {
  test('assert filters format', async () => {
    expect(new NostrSubscription({}).filters).toStrictEqual([])
    expect(new NostrSubscription([{}]).filters).toStrictEqual([])
    expect(new NostrSubscription([{ ids: ['1'] }]).filters).toStrictEqual([{ ids: ['1'] }])
    expect(new NostrSubscription([{ ids: ['1'] }, {}]).filters).toStrictEqual([{ ids: ['1'] }])
  })

  test('assert relayFilters stream with fixed relays and relayHints', async () => {
    const filters = [{ kinds: [0], authors: ['1', '2', '3'] }, { ids: ['10'] }]
    const sub = new NostrSubscription(filters, {
      relays: of([RELAY_1, RELAY_2]),
      relayHints: {
        authors: { '1': [RELAY_3] },
        ids: { '10': [RELAY_4] },
      },
    })
    const spy = subscribeSpyTo(sub.relayFilters)

    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, filters],
      [RELAY_2, filters],
      [RELAY_3, [{ kinds: [0], authors: ['1'] }]],
      [RELAY_4, [{ ids: ['10'] }]],
    ])
  })

  test('assert subscription with custom relayFilters stream', async () => {
    const sub = new NostrSubscription([], {
      relays: of([RELAY_1]),
      relayFilters: from([[RELAY_2, [{ kinds: [0] }]] as RelayFilters]),
    })
    const spy = subscribeSpyTo(sub.relayFilters)
    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([[RELAY_2, [{ kinds: [0] }]]])
  })

  test('assert outbox relays', async () => {
    const filters = [
      { kinds: [0], authors: ['1', '2', '3'] },
      { kinds: [1], authors: ['4', '5', '6'] },
    ]
    const sub = new NostrSubscription(filters, {
      relays: of([RELAY_1, RELAY_2]),
      outbox: (filters) => from<RelayFilters[]>([[RELAY_3, [{ ...filters[0], authors: ['1'] }]]]),
    })

    const spy = subscribeSpyTo(sub.relayFilters)

    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, filters],
      [RELAY_2, filters],
      [RELAY_3, [{ ...filters[0], authors: ['1'] }]],
    ])
  })

  test('assert transform filters', async () => {
    const filters = [
      { kinds: [0], authors: ['1', '2', '3'] },
      { kinds: [1], authors: ['4', '5', '6'] },
    ]
    const sub = new NostrSubscription(filters, {
      relays: of([RELAY_1]),
      transform: (filters) => [
        { kinds: filters[0].kinds, authors: ['1'] },
        { kinds: filters[1].kinds, authors: ['4'] },
      ],
    })
    const spy = subscribeSpyTo(sub.relayFilters)

    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [
        RELAY_1,
        [
          { kinds: [0], authors: ['1'] },
          { kinds: [1], authors: ['4'] },
        ],
      ],
    ])
  })

  test('assert duplicated relays', async () => {
    const sub = new NostrSubscription(
      { ids: ['1'] },
      {
        relays: merge(of([RELAY_1, RELAY_2]), of([RELAY_1, RELAY_2])),
      },
    )
    const spy = subscribeSpyTo(sub.relayFilters)

    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, [{ ids: ['1'] }]],
      [RELAY_2, [{ ids: ['1'] }]],
    ])
  })
})
