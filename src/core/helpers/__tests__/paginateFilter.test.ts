import { DateTime } from 'luxon'
import { vi } from 'vitest'
import { createFilterPagination } from '../createPaginationFilter'
import { paginateFilter } from '../paginateFilter'

describe('paginateFilter()', () => {
  const toUnix = (date: string) => DateTime.fromISO(date).toUnixInteger()

  const NOW = '2024-11-01T18:00:00.000Z'

  beforeEach(() => {
    vi.setSystemTime(new Date(NOW))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('Assert pagination range', () => {
    const range = 30
    let filter = createFilterPagination({ kinds: [0] }, range)
    expect(filter).toStrictEqual({
      kinds: [0],
      since: toUnix('2024-11-01T17:30:00.000Z'),
      until: toUnix('2024-11-01T18:00:00.000Z'),
    })
    filter = paginateFilter(filter, range)
    expect(filter).toStrictEqual({
      kinds: [0],
      since: toUnix('2024-11-01T17:00:00.000Z'),
      until: toUnix('2024-11-01T17:30:00.000Z'),
    })
    filter = paginateFilter(filter, range)
    expect(filter).toStrictEqual({
      kinds: [0],
      since: toUnix('2024-11-01T16:30:00.000Z'),
      until: toUnix('2024-11-01T17:00:00.000Z'),
    })
    // increase the range
    filter = paginateFilter(filter, range * 2)
    expect(filter).toStrictEqual({
      kinds: [0],
      since: toUnix('2024-11-01T15:30:00.000Z'),
      until: toUnix('2024-11-01T16:30:00.000Z'),
    })
  })
})
