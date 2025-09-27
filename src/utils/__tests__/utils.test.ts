import { compactArray } from '../utils'

test('compactArray', () => {
  expect(compactArray([[], [], ['1'], ['-'], ['p', '123']])).toStrictEqual([['-'], ['p', '123']])
})
