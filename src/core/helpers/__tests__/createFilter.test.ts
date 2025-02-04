import { createFilter } from '../createFilter'

test('assert createFilter()', () => {
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
  expect(createFilter({ kinds: [], authors: [], ids: [], '#e': [] })).toStrictEqual({})
  expect(createFilter({ kinds: [], authors: ['', '', '2'], ids: [], '#e': [] })).toStrictEqual({ authors: ['2'] })
  // @ts-expect-error testing
  expect(createFilter({ authors: [null, '123'], ids: [undefined, '123'], '#e': [] })).toStrictEqual({
    authors: ['123'],
    ids: ['123'],
  })
  expect(createFilter({ authors: ['1:1', '1'], ids: ['1:1', '1'], '#e': ['1:1', '1'] })).toStrictEqual({
    ids: ['1'],
    authors: ['1'],
    '#e': ['1'],
  })
  expect(createFilter({ kinds: [1], authors: ['', '', '2'], '#d': ['1'] })).toStrictEqual({
    kinds: [1],
    authors: ['2'],
    '#d': ['1'],
  })
})
