import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import { fakeNote } from '@/utils/faker'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { RelayFilters } from 'core/NostrSubscription'
import { NostrSubscription } from 'core/NostrSubscription'
import type { NostrEvent } from 'nostr-tools'
import { from, of } from 'rxjs'
import { mergeSubscriptions } from '../mergeSubscription'

describe('mergeSubscriptions()', () => {
  test('assert filters and relay hints', async () => {
    const sub1 = new NostrSubscription({ ids: ['1'] }, { relayHints: { ids: { '1': [RELAY_1] } } })
    const sub2 = new NostrSubscription({ ids: ['2'] }, { relayHints: { ids: { '2': [RELAY_2] } } })
    const sub3 = new NostrSubscription({ ids: ['3'] }, { relayHints: {} })

    const parent = mergeSubscriptions([sub1, sub2, sub3])

    const spy = subscribeSpyTo(parent.relayFilters)
    await spy.onComplete()

    expect(parent.filters).toStrictEqual([{ ids: ['1'] }, { ids: ['2'] }, { ids: ['3'] }])
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, [{ ids: ['1'] }]],
      [RELAY_2, [{ ids: ['2'] }]],
    ])
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
    const parent = mergeSubscriptions([sub1, sub2, sub3])

    const spy = subscribeSpyTo(parent.relayFilters)
    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, [{ ids: ['1'] }]],
      [RELAY_1, [{ ids: ['1'] }]],
      [RELAY_2, [{ ids: ['2'] }]],
      [RELAY_3, [{ ids: ['3'] }]],
    ])
  })

  test('assert events map', () => {
    const map1 = new Map<string, NostrEvent>()
    const map2 = new Map<string, NostrEvent>()
    const map3 = new Map<string, NostrEvent>()
    const map4 = new Map<string, NostrEvent>()
    const event1 = fakeNote({ id: '1' })
    const event2 = fakeNote({ id: '2' })
    const event3 = fakeNote({ id: '3' })
    const event4 = fakeNote({ id: '4' })
    map1.set(event1.id, event1)
    map2.set(event2.id, event2)
    map3.set(event3.id, event3)
    map4.set(event4.id, event4)
    const sub1 = new NostrSubscription({ ids: ['1'] }, { events: map1 })
    const sub2 = new NostrSubscription({ ids: ['2'] }, { events: map2 })
    const sub3 = new NostrSubscription({ ids: ['3'] }, { events: map3 })
    const parent = mergeSubscriptions([sub1, sub2, sub3])
    expect(parent.events.get('1')).toStrictEqual(event1)
    expect(parent.events.get('2')).toStrictEqual(event2)
    expect(parent.events.get('3')).toStrictEqual(event3)
    expect(parent.events.size).toBe(3)
  })
})
