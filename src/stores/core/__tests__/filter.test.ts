import { DateTime } from 'luxon'
import { fakeNote, fakeUser } from 'utils/faker'
import { test } from 'utils/fixtures'
import { Filter } from '../filter'
import { RelayHints } from '../subscription'

describe('Test utility filter functions', () => {
  describe('dedupeFilterKeys()', () => {
    test('Test dedupe authors key', () => {
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

    test('Expect to remove empty arrays', () => {
      expect(Filter.dedupeArrayFields({ authors: [], ids: [], '#e': [] })).toStrictEqual({})
    })

    test('Filter out null and undefined', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(Filter.dedupeArrayFields({ authors: [null, '123'], ids: [undefined, '123'], '#e': [] })).toStrictEqual({
        authors: ['123'],
        ids: ['123'],
      })
    })
  })

  describe('mergeFilters()', () => {
    test('Merge authors of kind [0]', () => {
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

    test('Merge ids of kind [0]', () => {
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

    test('Merge authors and ids of kind [0]', () => {
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

    test('Merge #e of kind[0]', () => {
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

    test('Merge authors of kind [0, 1, 6] and [0]', () => {
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

    test('Merge authors of kind [0] and `until` paginatiokn', () => {
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

    test('Merge authors of different kinds', () => {
      const result = Filter.merge([
        { kinds: [0], authors: ['npub1'] },
        { kinds: [0], authors: ['npub2'] },
        { kinds: [10002], authors: ['npub3'] },
        { kinds: [10002], authors: ['npub4'] },
      ])
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({ kinds: [0, 10002], authors: ['npub1', 'npub2', 'npub3', 'npub4'] })
    })

    test('Dont merge [0, 10002], with [1, 30023]', () => {
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
  })

  describe('filterInvalidFilters', () => {
    test('Test filterInvalidFilters', ({ createFilter }) => {
      expect(createFilter({ authors: [] }).isValid).toBe(false)
      expect(createFilter({ ids: ['1'] }).isValid).toBe(true)
      expect(createFilter({ authors: [], ids: [] }).isValid).toBe(false)
      expect(createFilter({ authors: [], ids: ['1'] }).isValid).toBe(true)
      expect(createFilter({ search: '' }).isValid).toBe(false)
      expect(createFilter({ search: 'search' }).isValid).toBe(true)
    })
  })

  describe('removeSeenKeys()', () => {
    test('Test without author key', ({ createFilter }) => {
      const filter = createFilter({ kinds: [0] })
      filter.removeStoredKeys()
      expect(filter.data).toStrictEqual({ kinds: [0] })
    })

    test('Test author [1, 2] removed', ({ root, createFilter }) => {
      root.users.add(fakeUser('1'))
      root.users.add(fakeUser('2'))
      const filter = createFilter({ kinds: [0], authors: ['1', '2', '3', '4'] })
      filter.removeStoredKeys()
      expect(filter.data).toStrictEqual({ kinds: [0], authors: ['3', '4'] })
    })

    test('Test without ids key', ({ createFilter }) => {
      const filter = createFilter({ kinds: [1] })
      filter.removeStoredKeys()
      expect(filter.data).toStrictEqual({ kinds: [1] })
    })

    test('Test id [1, 2] removed', ({ root, createFilter }) => {
      root.notes.add(fakeNote({ id: '1' }))
      root.notes.add(fakeNote({ id: '2' }))
      const filter = createFilter({ kinds: [1], ids: ['1', '2', '3', '4'] })
      filter.removeStoredKeys()
      expect(filter.data).toStrictEqual({ kinds: [1], ids: ['3', '4'] })
    })
  })

  describe('nextPage', () => {
    test('assert pagination range of 1 hour', ({ createFilter }) => {
      const date = DateTime.fromISO('2023-01-01T12:00:00')
      const filter = createFilter(
        { since: date.minus({ hours: 1 }).toUnixInteger(), until: date.toUnixInteger() },
        { pagination: false, range: 60 },
      )
      filter.nextPage()
      expect(filter.data.since).toBe(date.minus({ hours: 2 }).toUnixInteger())
      expect(filter.data.until).toBe(date.minus({ hours: 1 }).toUnixInteger())
      filter.nextPage()
      expect(filter.data.since).toBe(date.minus({ hours: 3 }).toUnixInteger())
      expect(filter.data.until).toBe(date.minus({ hours: 2 }).toUnixInteger())
      // custom range
      filter.nextPage(60 * 3)
      expect(filter.data.since).toBe(date.minus({ hours: 6 }).toUnixInteger())
      expect(filter.data.until).toBe(date.minus({ hours: 3 }).toUnixInteger())
      filter.nextPage()
      expect(filter.data.since).toBe(date.minus({ hours: 7 }).toUnixInteger())
      expect(filter.data.until).toBe(date.minus({ hours: 6 }).toUnixInteger())
      filter.options.range = 60 * 2
      filter.nextPage()
      expect(filter.data.since).toBe(date.minus({ hours: 9 }).toUnixInteger())
      expect(filter.data.until).toBe(date.minus({ hours: 7 }).toUnixInteger())
    })
  })

  describe('groupAuthorsByRelay', () => {
    test('Invalid filter', async ({ root }) => {
      const filter = { kinds: [0], '#e': ['1', '2', '3', '4', '5'] }
      expect((await Filter.groupAuthorsByRelay(filter, root)).result).toStrictEqual({})
    })

    test('Assert relays for authors', async ({ root, createRelayList }) => {
      await createRelayList({ pubkey: '1', tags: [['r', 'wss://relay1.com']] })
      await createRelayList({ pubkey: '2', tags: [['r', 'wss://relay2.com']] })
      await createRelayList({ pubkey: '3', tags: [['r', 'wss://relay3.com']] })
      await createRelayList({ pubkey: '4', tags: [['r', 'wss://relay1.com']] })
      await createRelayList({
        pubkey: '5',
        tags: [
          ['r', 'wss://relay1.com'],
          ['r', 'wss://relay2.com'],
        ],
      })
      const filterMetadata = { kinds: [0], authors: ['1', '2', '3', '4', '5'] }

      expect((await Filter.groupAuthorsByRelay(filterMetadata, root)).result).toStrictEqual({
        'wss://relay1.com': { kinds: [0], authors: ['1', '4', '5'] },
        'wss://relay2.com': { kinds: [0], authors: ['2', '5'] },
        'wss://relay3.com': { kinds: [0], authors: ['3'] },
      })

      const filterNotes = { kinds: [1], authors: ['1', '2', '3', '4', '5'] }

      expect((await Filter.groupAuthorsByRelay(filterNotes, root)).result).toStrictEqual({
        'wss://relay1.com': { kinds: [1], authors: ['1', '4', '5'] },
        'wss://relay2.com': { kinds: [1], authors: ['2', '5'] },
        'wss://relay3.com': { kinds: [1], authors: ['3'] },
      })
    })

    test('Test pending relay authors', async ({ root, createRelayList }) => {
      await createRelayList({ pubkey: '1', tags: [['r', 'wss://relay1.com']] })
      await createRelayList({ pubkey: '2', tags: [['r', 'wss://relay2.com']] })

      const filter = { kinds: [0], authors: ['1', '2', '3', '4'] }
      const data = await Filter.groupAuthorsByRelay(filter, root)
      expect(data.result).toStrictEqual({
        'wss://relay1.com': { kinds: [0], authors: ['1'] },
        'wss://relay2.com': { kinds: [0], authors: ['2'] },
      })
      expect(data.pending).toStrictEqual({
        kinds: [0],
        authors: ['3', '4'],
      })

      await createRelayList({ pubkey: '3', tags: [['r', 'wss://relay3.com']] })

      expect((await Filter.groupAuthorsByRelay(data.pending, root)).pending).toStrictEqual({
        kinds: [0],
        authors: ['4'],
      })
    })

    describe('Relay hints', () => {
      test('Test relay hints authors', async ({ root, createRelayList }) => {
        const relayHints: RelayHints = {
          authors: {
            '1': ['wss://relay1.com', 'wss://relay2.com'],
            '2': ['wss://relay3.com', 'wss://relay4.com'],
            '3': ['wss://relay1.com'],
          },
        }
        await createRelayList({ pubkey: '5', tags: [['r', 'wss://relay5.com']] })
        await createRelayList({ pubkey: '6', tags: [['r', 'wss://relay1.com']] })
        const filter = { kinds: [0], authors: ['1', '2', '3', '4', '5', '6'] }
        expect((await Filter.groupAuthorsByRelay(filter, root, relayHints)).result).toStrictEqual({
          'wss://relay1.com': { kinds: [0], authors: ['1', '3', '6'] },
          'wss://relay2.com': { kinds: [0], authors: ['1'] },
          'wss://relay3.com': { kinds: [0], authors: ['2'] },
          'wss://relay4.com': { kinds: [0], authors: ['2'] },
          'wss://relay5.com': { kinds: [0], authors: ['5'] },
        })
      })

      test('Test relay hints authors with ids', async ({ root }) => {
        const relayHints: RelayHints = {
          ids: {
            '1': ['wss://relay1.com', 'wss://relay2.com'],
            '2': ['wss://relay1.com'],
          },
        }
        const filter = { kinds: [1], ids: ['1', '2', '3'] }
        expect((await Filter.groupAuthorsByRelay(filter, root, relayHints)).result).toStrictEqual({
          'wss://relay1.com': { kinds: [1], ids: ['1', '2'] },
          'wss://relay2.com': { kinds: [1], ids: ['1'] },
        })
      })
    })
  })
})
