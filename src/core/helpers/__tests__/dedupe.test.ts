import { dedupe } from "../dedupe"

describe('dedupe()', () => {
  test('Test dedupe [1, 2]', () => {
    expect(dedupe(['1', '1', '2', '2'])).toStrictEqual(['1', '2'])
  })

  test('Test multiple arguments', () => {
    expect(dedupe(['1', '1', '2', '2'], ['1', '3', '3', '4', '4'])).toStrictEqual(['1', '2', '3', '4'])
  })

  test('Test with undefined', () => {
    expect(dedupe(['1', '1', '2', '2'], undefined)).toStrictEqual(['1', '2'])
  })

  test('Test with nested arrays', () => {
    expect(dedupe([], [])).toStrictEqual([])
    expect(dedupe([], [[]])).toStrictEqual([])
    expect(dedupe([[]], [[]])).toStrictEqual([])
    expect(dedupe([[]], [[], []])).toStrictEqual([])
    expect(dedupe([[]], [[[]], []])).toStrictEqual([])
    expect(dedupe([[]], [[[]], [[]]])).toStrictEqual([])
  })

  test('test with undefined and null', () => {
    expect(dedupe([null], [null])).toStrictEqual([])
    expect(dedupe([undefined], [undefined])).toStrictEqual([])
  })
})
