import { subscribeSpyTo } from "@hirez_io/observer-spy"
import { from } from "rxjs"
import { fakeNote } from "utils/faker"
import { insertEvent } from "../insertEvent"

test('insertEvent()', async () => {
  const note1 = fakeNote({ kind: 0, id: '1', pubkey: '1', created_at: 5 })
  const note2 = fakeNote({ kind: 0, id: '2', pubkey: '1', created_at: 10 })
  const note3 = fakeNote({ kind: 0, id: '3', pubkey: '1', created_at: 8 }) // old created_at, ignored
  const note4 = fakeNote({ kind: 0, id: '4', pubkey: '1', created_at: 15 })

  const $ = from([note1, note2, note3, note4]).pipe(insertEvent())

  const spy = subscribeSpyTo($)
  await spy.onComplete()

  expect(spy.getValues()).toStrictEqual([note1, note2, note4])
})
