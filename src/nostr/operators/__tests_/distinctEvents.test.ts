import { subscribeSpyTo } from "@hirez_io/observer-spy"
import type { NostrEvent } from "core/types"
import { of } from "rxjs"
import { fakeNote } from "utils/faker"
import { distinctEvent } from "../distinctEvents"

describe('Seen', () => {
  test('assert distinctEvents', async () => {
    const note1 = fakeNote({ id: '0' })
    const note2 = fakeNote({ id: '1' })
    const note3 = fakeNote({ id: '2' })
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
})
