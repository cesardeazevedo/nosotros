import { Filter as NostrFilter } from 'nostr-tools'
import { dedupe, groupKeysToArray, pickBy, replaceToArray } from 'utils/utils'

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

  describe('replaceToArray()', () => {
    test('Test as regex', () => {
      const expected = ['test ', { content: 'replace' }, ' test string']
      expect(replaceToArray('test replace test string', /(replace)/, (match) => ({ content: match }))).toStrictEqual(
        expected,
      )
      expect(replaceToArray(expected, /(string)/, (match) => ({ content: match }))).toStrictEqual([
        'test ',
        { content: 'replace' },
        ' test ',
        { content: 'string' },
      ])
    })

    test('Test regex on string', () => {
      const content = `1 2 test 3 4 test 5 6`
      expect(replaceToArray(content, /test/g, () => 'replaced')).toStrictEqual([
        '1 2 ',
        'replaced',
        ' 3 4 ',
        'replaced',
        ' 5 6',
      ])
    })

    test('Test with multiple replacements', () => {
      expect(replaceToArray('Hello Test Test Test !', /(Test)/g, (match) => ({ content: match }))).toStrictEqual([
        'Hello ',
        { content: 'Test' },
        ' ',
        { content: 'Test' },
        ' ',
        { content: 'Test' },
        ' !',
      ])
    })

    test('Test as string', () => {
      expect(replaceToArray('Hello #[0]', '#[0]', (match) => ({ content: match }))).toStrictEqual([
        'Hello ',
        { content: '#[0]' },
      ])
    })

    test('Test multiple elements', () => {
      const content = `
Hello Nostr 

https://nostr.com/get-started

https://nostr.com/the-protocol/nips
    `
      const expected = [
        `
Hello Nostr 

`,
        {
          content: 'replaced',
        },
        `

https://nostr.com/the-protocol/nips
    `,
      ]

      expect(replaceToArray(content, 'https://nostr.com/get-started', () => ({ content: 'replaced' }))).toStrictEqual(
        expected,
      )

      expect(
        replaceToArray(expected, 'https://nostr.com/the-protocol/nips', () => ({ content: 'replaced' })),
      ).toStrictEqual([
        `
Hello Nostr 

`,
        { content: 'replaced' },
        `

`,
        { content: 'replaced' },
        `
    `,
      ])
    })
  })
})
