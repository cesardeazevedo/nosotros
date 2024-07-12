import { subscribeSpyTo } from "@hirez_io/observer-spy"
import { of } from "rxjs"
import { fakeNote } from "utils/faker"
import { ofKind } from "../ofKind"

test('ofKind', () => {
  const kind0 = fakeNote({ kind: 0 })
  const kind1 = fakeNote({ kind: 1 })
  const kind2 = fakeNote({ kind: 2 })
  const kind3 = fakeNote({ kind: 3 })
  const kind4 = fakeNote({ kind: 4 })
  const source = of(kind0, kind1, kind2, kind3, kind4)

  const kind0$ = source.pipe(ofKind([0]))
  const kind1$ = source.pipe(ofKind([1]))
  const kind2$ = source.pipe(ofKind([2]))
  const kindall$ = source.pipe(ofKind([0, 1, 2, 3, 4]))

  expect(subscribeSpyTo(kind0$).getValues()).toStrictEqual([kind0])
  expect(subscribeSpyTo(kind1$).getValues()).toStrictEqual([kind1])
  expect(subscribeSpyTo(kind2$).getValues()).toStrictEqual([kind2])
  expect(subscribeSpyTo(kindall$).getValues()).toStrictEqual([kind0, kind1, kind2, kind3, kind4])
})
