import { groupKeysFromArray } from "../groupKeysFromArray"

describe('groupKeysFromArray()', () => {
  test('Test simple values', () => {
    expect(groupKeysFromArray([{ a: 1 }, { a: 2 }])).toStrictEqual({ a: [1, 2] })
    expect(groupKeysFromArray([{ a: [1] }, { a: [2] }])).toStrictEqual({ a: [1, 2] })
    expect(groupKeysFromArray([{ a: [1, 2] }, { a: [1, 2] }])).toStrictEqual({ a: [1, 2] })
    expect(groupKeysFromArray([{ a: 1 }, { b: 2 }])).toStrictEqual({ a: [1], b: [2] })
    expect(groupKeysFromArray([{ a: 1 }, { a: '2' }])).toStrictEqual({ a: [1, '2'] })
    expect(groupKeysFromArray([undefined, { b: 2 }])).toStrictEqual({ b: [2] })
  })

  test('Test simple NostrFilter type', () => {
    const a = { kinds: [0], authors: ['1'] }
    const b = { kinds: [0], authors: ['2'] }
    expect(groupKeysFromArray([a, b])).toStrictEqual({ kinds: [0], authors: ['1', '2'] })
  })
})
