import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { of } from 'rxjs'
import { fakeNote } from 'utils/faker'
import { filterReplaceableEvent } from '../filterReplaceableEvent'
import { insertEvent } from '../insertEvent'

describe('filterReplaceableEvent()', () => {
  test('assert old replaceable events out of the stream', () =>
    new Promise<void>((resolve) => {
      const event1 = fakeNote({ kind: 0, id: '1', pubkey: '1', created_at: 10 })
      const event2 = fakeNote({ kind: 0, id: '2', pubkey: '1', created_at: 20 })
      const event3 = fakeNote({ kind: 0, id: '3', pubkey: '1', created_at: 10 })
      const event4 = fakeNote({ kind: 0, id: '4', pubkey: '1', created_at: 50 })
      const event5 = fakeNote({ kind: 0, id: '5', pubkey: '1', created_at: 40 })
      const event6 = fakeNote({ kind: 0, id: '6', pubkey: '1', created_at: 60 })
      // different pubkey
      const event7 = fakeNote({ kind: 0, id: '7', pubkey: '2', created_at: 5 })
      const event8 = fakeNote({ kind: 0, id: '8', pubkey: '2', created_at: 10 })
      const event9 = fakeNote({ kind: 0, id: '9', pubkey: '2', created_at: 8 })

      const $ = of(event1, event2, event3, event4, event5, event6, event7, event8, event9).pipe(
        filterReplaceableEvent(),
        insertEvent(),
      )

      const spy = subscribeSpyTo($)

      spy.onComplete(() => {
        expect(spy.getValues()).toStrictEqual([event1, event2, event4, event6, event7, event8])
        resolve()
      })
    }))
})
