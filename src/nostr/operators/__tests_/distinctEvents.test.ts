import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { NostrEvent } from 'core/types'
import { of } from 'rxjs'
import { fakeEvent } from 'utils/faker'
import { distinctEvent } from '../distinctEvents'

describe('distinctEvents()', () => {
  test('assert distinctEvents', async () => {
    const note1 = fakeEvent({ id: '0' })
    const note2 = fakeEvent({ id: '1' })
    const note3 = fakeEvent({ id: '2' })
    const $ = of<[string, NostrEvent][]>(
      ['a', note1],
      ['b', note1],
      ['c', note1],
      ['a', note2],
      ['b', note2],
      ['c', note2],
      ['a', note3],
      ['b', note3],
      ['c', note3],
    ).pipe(distinctEvent())

    const spy = subscribeSpyTo($)

    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([note1, note2, note3])
  })

  test('assert distinctEvents for replaceable events', async () => {
    const note1 = fakeEvent({ kind: 0, id: '1', created_at: 1 })
    const note2 = fakeEvent({ kind: 0, id: '2', created_at: 2 })
    const note3 = fakeEvent({ kind: 0, id: '3', created_at: 3 })
    const note4 = fakeEvent({ kind: 0, id: '4', created_at: 4 })
    const $ = of<[string, NostrEvent][]>(
      ['a', note3],
      ['b', note3],
      ['a', note2],
      ['b', note2],
      ['a', note1],
      ['b', note1],
      ['d', note4],
    ).pipe(distinctEvent())

    const spy = subscribeSpyTo($)

    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([note3, note2, note1, note4])
  })
})
