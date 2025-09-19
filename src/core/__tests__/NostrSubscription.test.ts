import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, RELAY_5 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { RelayFilters } from 'core/NostrSubscription'
import { from } from 'rxjs'
import { NostrSubscriptionBuilder } from '../NostrSubscriptionBuilder'

describe('NostrSubscription', () => {
  test('assert relayFilters stream with fixed relays and relayHints', async () => {
    const filter = { kinds: [0], authors: ['1', '2', '3'] }
    const sub = new NostrSubscriptionBuilder({
      filter,
      relays: [RELAY_1, RELAY_2],
      relayHints: {
        authors: { '1': [RELAY_3] },
        ids: { '10': [RELAY_4] },
      },
    })
    const spy = subscribeSpyTo(sub.relayFilters)

    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, filter],
      [RELAY_2, filter],
      [RELAY_3, { kinds: [0], authors: ['1'] }],
    ])
  })

  test('assert subscription with custom relayFilters stream', async () => {
    const sub = new NostrSubscriptionBuilder({
      relays: [RELAY_1],
      filter: { kinds: [1] },
      relayFilters: from([[RELAY_2, { kinds: [0] }] as RelayFilters]),
    })
    const spy = subscribeSpyTo(sub.relayFilters)
    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [RELAY_2, { kinds: [0] }],
      [RELAY_1, { kinds: [1] }],
    ])
  })

  test('assert duplicated relays', async () => {
    const sub = new NostrSubscriptionBuilder({
      filter: { ids: ['1'] },
      relays: [RELAY_1, RELAY_2, RELAY_1, RELAY_2],
    })
    const spy = subscribeSpyTo(sub.relayFilters)

    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, { ids: ['1'] }],
      [RELAY_2, { ids: ['1'] }],
    ])
  })

  test('assert many relay hints', async () => {
    const sub = new NostrSubscriptionBuilder({
      filter: { authors: ['1'] },
      relays: [RELAY_5],
      relayHints: {
        authors: { '1': [RELAY_5, RELAY_1, RELAY_2, RELAY_3, RELAY_3, RELAY_4] },
      },
    })
    const spy = subscribeSpyTo(sub.relayFilters)

    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [RELAY_5, { authors: ['1'] }],
      [RELAY_1, { authors: ['1'] }],
      [RELAY_2, { authors: ['1'] }],
      [RELAY_3, { authors: ['1'] }],
      [RELAY_4, { authors: ['1'] }],
    ])
  })
})
