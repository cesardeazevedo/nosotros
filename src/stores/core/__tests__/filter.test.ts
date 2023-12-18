import { DateTime } from 'luxon'
import { fakeUser } from 'utils/faker'
import { test } from 'utils/fixtures'
import { Filter } from '../filter'

describe('Filter', () => {
  describe('dedupeFilterKeys()', () => {
    test('Should expect not duplicates on `authors`, `ids`, `#e` and `kinds`', () => {
      const result = Filter.dedupeArrayFields({
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
      expect(Filter.dedupeArrayFields({ kinds: [], authors: [], ids: [], '#e': [] })).toStrictEqual({})
    })

    test('Shoudl expect filter out null and undefined', () => {
      // @ts-expect-error testing
      expect(Filter.dedupeArrayFields({ authors: [null, '123'], ids: [undefined, '123'], '#e': [] })).toStrictEqual({
        authors: ['123'],
        ids: ['123'],
      })
    })
  })

  describe('merge()', () => {
    test('Should expect authors of kind [0] being merged', () => {
      const result = Filter.merge([
        { kinds: [0], authors: ['npub1'] },
        { kinds: [0], authors: ['npub2'] },
        { kinds: [0], authors: ['npub2'] },
        { kinds: [0], authors: ['npub3'], until: 10 },
      ])
      expect(result).toHaveLength(2)
      expect(result[0]).toStrictEqual({ kinds: [0], authors: ['npub1', 'npub2'] })
      expect(result[1]).toStrictEqual({ kinds: [0], authors: ['npub3'], until: 10 })
    })

    test('Should expect ids of kind [0] being merged, except for the the filter with `until` field', () => {
      const result = Filter.merge([
        { kinds: [0], ids: ['1'] },
        { kinds: [0], ids: ['2'] },
        { kinds: [0], ids: ['2'] },
        { kinds: [0], ids: ['3'], until: 10 },
      ])
      expect(result).toHaveLength(2)
      expect(result[0]).toStrictEqual({ kinds: [0], ids: ['1', '2'] })
      expect(result[1]).toStrictEqual({ kinds: [0], ids: ['3'], until: 10 })
    })

    test('Should expect authors and ids being merged separately', () => {
      const result = Filter.merge([
        { kinds: [0], authors: ['1'] },
        { kinds: [0], authors: ['2'] },
        { kinds: [0], ids: ['2'] },
        { kinds: [0], ids: ['3'] },
      ])
      expect(result).toHaveLength(2)
      expect(result[0]).toStrictEqual({ kinds: [0], authors: ['1', '2'] })
      expect(result[1]).toStrictEqual({ kinds: [0], ids: ['2', '3'] })
    })

    test('Should expect #e of kind [0] being merged', () => {
      const result = Filter.merge([
        { kinds: [0], '#e': ['1'] },
        { kinds: [0], '#e': ['2'] },
        { kinds: [0], '#e': ['2'] },
        { kinds: [0], '#e': ['3'], until: 10 },
      ])
      expect(result).toHaveLength(2)
      expect(result[0]).toStrictEqual({ kinds: [0], '#e': ['1', '2'] })
      expect(result[1]).toStrictEqual({ kinds: [0], '#e': ['3'], until: 10 })
    })

    test('Should expect merge authors of kind [0, 1, 6] and [0]', () => {
      const result = Filter.merge([
        { kinds: [0, 1, 6], authors: ['npub1'] },
        { kinds: [6, 1, 0], authors: ['npub2'] }, // out of order
        { kinds: [0], authors: ['npub3'] },
        { kinds: [0], authors: ['npub4'], until: 10 },
      ])
      expect(result).toHaveLength(3)
      expect(result[0]).toStrictEqual({ kinds: [0, 1, 6], authors: ['npub1', 'npub2'] })
      expect(result[1]).toStrictEqual({ kinds: [0], authors: ['npub3'] })
      expect(result[2]).toStrictEqual({ kinds: [0], authors: ['npub4'], until: 10 })
    })

    test('Should expect merge authors of kind [0] with the same `until` pagination value', () => {
      const result = Filter.merge([
        { kinds: [0], authors: ['npub1'], until: 10 },
        { kinds: [0], authors: ['npub2'], until: 10 },
        { kinds: [0], authors: ['npub3'], until: 15 },
        { kinds: [0], authors: ['npub4'], until: 15 },
      ])
      expect(result).toHaveLength(2)
      expect(result[0]).toStrictEqual({ kinds: [0], authors: ['npub1', 'npub2'], until: 10 })
      expect(result[1]).toStrictEqual({ kinds: [0], authors: ['npub3', 'npub4'], until: 15 })
    })

    test('Should expect merge authors of different kinds', () => {
      const result = Filter.merge([
        { kinds: [0], authors: ['npub1'] },
        { kinds: [0], authors: ['npub2'] },
        { kinds: [10002], authors: ['npub3'] },
        { kinds: [10002], authors: ['npub4'] },
      ])
      expect(result).toHaveLength(2)
      expect(result).toStrictEqual([
        { kinds: [0], authors: ['npub1', 'npub2'] },
        { kinds: [10002], authors: ['npub3', 'npub4'] },
      ])
    })

    test('Should not expect the merge of [0, 10002] with [1, 30023]', () => {
      const result = Filter.merge([
        { kinds: [0, 10002], authors: ['npub1'] },
        { kinds: [1, 30023], ids: ['1'] },
      ])
      expect(result).toHaveLength(2)
      expect(result).toStrictEqual([
        { kinds: [0, 10002], authors: ['npub1'] },
        { kinds: [1, 30023], ids: ['1'] },
      ])
    })

    test('Should not merge kind 0 and 1', () => {
      const result = Filter.merge([
        { kinds: [0, 10002], authors: ['1'] },
        { kinds: [1, 30023], authors: ['2'] },
      ])
      expect(result).toStrictEqual([
        { kinds: [0, 10002], authors: ['1'] },
        { kinds: [1, 30023], authors: ['2'] },
      ])
    })

    test('Should merge ids without kind', () => {
      const result = Filter.merge([{ ids: ['1'] }, { ids: ['2'] }])
      expect(result).toStrictEqual([{ ids: ['1', '2'] }])
    })
  })

  describe('isValid', () => {
    test('Should expect isValid based on filters', ({ createFilter }) => {
      expect(createFilter({ ids: ['1'] }).isValid).toBe(true)
      expect(createFilter({ search: 'search' }).isValid).toBe(true)
      expect(createFilter({ kinds: [0], authors: [] }).isValid).toBe(false)
      expect(createFilter({ kinds: [0], ids: ['1'] }).isValid).toBe(true)
      expect(createFilter({ kinds: [0], authors: [], ids: [] }).isValid).toBe(false)
      expect(createFilter({ kinds: [0], authors: [], ids: ['1'] }).isValid).toBe(true)
      expect(createFilter({ kinds: [0], search: '' }).isValid).toBe(false)
      expect(createFilter({ kinds: [0], search: 'search' }).isValid).toBe(true)
    })
  })

  describe('removeSeenKeys()', () => {
    test('Should expect run without any authors', ({ createFilter }) => {
      const filter = createFilter({ kinds: [0] })
      filter.removeStoredKeys()
      expect(filter.data).toStrictEqual({ kinds: [0] })
    })

    test('Should expect author [1, 2] removed', async ({ root, createFilter }) => {
      await root.users.add(fakeUser('1', {}))
      await root.users.add(fakeUser('2', {}))
      const filter = createFilter({ kinds: [0], authors: ['1', '2', '3', '4'] })
      filter.removeStoredKeys()
      expect(filter.data).toStrictEqual({ kinds: [0], authors: ['3', '4'] })
    })

    test('Should expect run without any ids', ({ createFilter }) => {
      const filter = createFilter({ kinds: [1] })
      filter.removeStoredKeys()
      expect(filter.data).toStrictEqual({ kinds: [1] })
    })

    test('Should expect id [1, 2] removed', ({ root, createNote, createFilter }) => {
      root.notes.add(createNote({ id: '1' }))
      root.notes.add(createNote({ id: '2' }))
      const filter = createFilter({ kinds: [1], ids: ['1', '2', '3', '4'] })
      filter.removeStoredKeys()
      expect(filter.data).toStrictEqual({ kinds: [1], ids: ['3', '4'] })
    })
  })

  describe('nextPage()', () => {
    test('Should expect pagination range', ({ createFilter }) => {
      const date = DateTime.fromISO('2023-01-01T12:00:00')
      const filter = createFilter(
        { since: date.minus({ hours: 1 }).toUnixInteger(), until: date.toUnixInteger() },
        { pagination: false, range: 60 },
      )
      filter.nextPage()
      expect(filter.data.until).toBe(date.minus({ hours: 1 }).toUnixInteger())
      expect(filter.data.since).toBe(date.minus({ hours: 2 }).toUnixInteger())
      filter.nextPage()
      expect(filter.data.until).toBe(date.minus({ hours: 2 }).toUnixInteger())
      expect(filter.data.since).toBe(date.minus({ hours: 3 }).toUnixInteger())
      // Set new range of 3 hours
      filter.nextPage(60 * 3)
      expect(filter.data.until).toBe(date.minus({ hours: 3 }).toUnixInteger())
      expect(filter.data.since).toBe(date.minus({ hours: 6 }).toUnixInteger())
      filter.nextPage()
      expect(filter.data.until).toBe(date.minus({ hours: 6 }).toUnixInteger())
      expect(filter.data.since).toBe(date.minus({ hours: 9 }).toUnixInteger())
      // range of 2 hours
      filter.nextPage(60 * 2)
      expect(filter.data.until).toBe(date.minus({ hours: 9 }).toUnixInteger())
      expect(filter.data.since).toBe(date.minus({ hours: 11 }).toUnixInteger())
    })
  })
})
