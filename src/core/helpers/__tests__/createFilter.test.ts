import { createFilter } from '../createFilter'

describe('createFilter()', () => {
  test('Should expect not duplicates on `authors`, `ids`, `#e` and `kinds`', () => {
    const result = createFilter({
      kinds: [0, 0],
      authors: ['1', '1', '2', '2'],
      ids: ['1', '1', '2', '2'],
      '#e': ['1', '1', '2', '2'],
      limit: 10,
    })
    expect(result).toStrictEqual({
      kinds: [0],
      authors: ['1', '2'],
      ids: ['1', '2'],
      '#e': ['1', '2'],
      limit: 10,
    })
  })

  test('Should expect to remove empty arrays', () => {
    expect(createFilter({ kinds: [], authors: [], ids: [], '#e': [] })).toStrictEqual({})
  })

  test('Should expect to remove empty strings', () => {
    expect(createFilter({ kinds: [], authors: ['', '', '2'], ids: [], '#e': [] })).toStrictEqual({ authors: ['2'] })
  })

  test('Should expect filter out null and undefined', () => {
    // @ts-expect-error testing
    expect(createFilter({ authors: [null, '123'], ids: [undefined, '123'], '#e': [] })).toStrictEqual({
      authors: ['123'],
      ids: ['123'],
    })
  })
})
