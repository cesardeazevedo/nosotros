import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { RelayFilters } from 'core/NostrSubscription'
import { NostrSubscription } from 'core/NostrSubscription'
import { from, of } from 'rxjs'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from 'utils/fixtures'
import { mergeSubscriptions } from '../mergeSubscription'

describe('mergeSubscription', () => {
  test('assert filters and relay hints', () => {
    const sub1 = new NostrSubscription({ ids: ['1'] }, { relayHints: { ids: { '1': [RELAY_1] } } })
    const sub2 = new NostrSubscription({ ids: ['2'] }, { relayHints: { ids: { '2': [RELAY_2] } } })
    const sub3 = new NostrSubscription({ ids: ['3'] }, { relayHints: {} })

    const parent = mergeSubscriptions([sub1, sub2, sub3])

    expect(parent.filters).toStrictEqual([
      {
        ids: ['1', '2', '3'],
      },
    ])

    expect(parent.relayHints).toStrictEqual({
      ids: {
        '1': ['wss://relay1.com'],
        '2': ['wss://relay2.com'],
      },
    })
  })

  test('assert outbox stream', async () => {
    const sub1 = new NostrSubscription(
      { ids: ['1'] },
      {
        relays: of([RELAY_1]),
        outbox: () => from<RelayFilters[]>([[RELAY_1, [{ ids: ['1'] }]]]),
      },
    )
    const sub2 = new NostrSubscription(
      { ids: ['2'] },
      {
        outbox: () => from<RelayFilters[]>([[RELAY_2, [{ ids: ['2'] }]]]),
      },
    )
    const sub3 = new NostrSubscription(
      { ids: ['3'] },
      {
        outbox: () => from<RelayFilters[]>([[RELAY_3, [{ ids: ['3'] }]]]),
      },
    )
    const parent = mergeSubscriptions([sub1, sub2, sub3], {
      outbox: () => from<RelayFilters[]>([[RELAY_4, [{ ids: ['1', '2', '3'] }]]]),
    })

    const spy = subscribeSpyTo(parent.relayFilters)
    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, [{ ids: ['1'] }]],
      [RELAY_1, [{ ids: ['1'] }]],
      [RELAY_2, [{ ids: ['2'] }]],
      [RELAY_3, [{ ids: ['3'] }]],
      [RELAY_4, [{ ids: ['1', '2', '3'] }]], // parent outbox stream
    ])
  })
})
