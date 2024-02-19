import type { Filter as NostrFilter } from 'nostr-tools'
import { dedupe, groupKeysToArray, pickBy } from 'utils/utils'

describe('Test utils', () => {
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

  describe('pickBy()', () => {
    test('Test pickBy ["a", "b"] and assert c is out', () => {
      expect(pickBy({ a: true, b: true, c: true }, ['a', 'b'])).toStrictEqual({ a: true, b: true })
    })
  })

  describe('groupKeysToArray()', () => {
    test('Test simple values', () => {
      expect(groupKeysToArray([{ a: 1 }, { a: 2 }])).toStrictEqual({ a: [1, 2] })
      expect(groupKeysToArray([{ a: [1] }, { a: [2] }])).toStrictEqual({ a: [1, 2] })
      expect(groupKeysToArray([{ a: [1, 2] }, { a: [1, 2] }])).toStrictEqual({ a: [1, 2] })
      expect(groupKeysToArray([{ a: 1 }, { b: 2 }])).toStrictEqual({ a: [1], b: [2] })
      expect(groupKeysToArray([undefined, { b: 2 }])).toStrictEqual({ b: [2] })
    })

    test('Test simple NostrFilter type', () => {
      const a: NostrFilter = { kinds: [0], authors: ['1'] }
      const b: NostrFilter = { kinds: [0], authors: ['2'] }
      expect(groupKeysToArray([a, b])).toStrictEqual({ kinds: [0], authors: ['1', '2'] })
    })
  })
})
