import { createFilter } from '../createFilter'
import { isFilterValid } from '../isFilterValid'

test('isValid()', () => {
  expect(isFilterValid(createFilter({ ids: [] }))).toBe(false)
  expect(isFilterValid(createFilter({ authors: [] }))).toBe(false)
  expect(isFilterValid(createFilter({ ids: [], kinds: [1] }))).toBe(false)
  expect(isFilterValid(createFilter({ kinds: [] }))).toBe(false)
  expect(isFilterValid(createFilter({ kinds: [1] }))).toBe(false)
  // valid filters
  expect(isFilterValid(createFilter({ ids: ['1'] }))).toBe(true)
  expect(isFilterValid(createFilter({ kinds: [1], since: 0, until: 10 }))).toBe(true)
  expect(isFilterValid(createFilter({ kinds: [1], limit: 10 }))).toBe(true)
  expect(isFilterValid(createFilter({ search: 'search' }))).toBe(true)
  expect(isFilterValid(createFilter({ kinds: [0], ids: ['1'] }))).toBe(true)
  expect(isFilterValid(createFilter({ kinds: [0], '#e': ['1'] }))).toBe(true)
  expect(isFilterValid(createFilter({ kinds: [0], '#p': ['1'] }))).toBe(true)
  expect(isFilterValid(createFilter({ kinds: [0], authors: [], ids: ['1'] }))).toBe(true)
  expect(isFilterValid(createFilter({ kinds: [0], search: 'search' }))).toBe(true)
})
