import { pickBy } from "../pickBy"

test('Test pickBy ["a", "b"] and assert c is out', () => {
  expect(pickBy({ a: true, b: true, c: true }, ['a', 'b'])).toStrictEqual({ a: true, b: true })
})
