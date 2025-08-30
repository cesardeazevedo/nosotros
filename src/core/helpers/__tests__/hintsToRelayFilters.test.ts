import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from '@/constants/testRelays'
import type { RelayHints } from 'core/types'
import { hintsToRelayFilters } from '../hintsToRelayFilters'

describe('hintsToRelayFilters', () => {
  test('assert authors', () => {
    const filters = { kinds: [0, 1], authors: ['1', '2', '3', '4'] }
    const hints = {
      authors: {
        '1': [RELAY_1, RELAY_2],
        '2': [RELAY_3, RELAY_4],
        '3': [RELAY_2, RELAY_3],
        '4': [RELAY_1, RELAY_4],
      },
    } as RelayHints

    const res = hintsToRelayFilters(filters, hints)

    expect(res).toStrictEqual([
      [RELAY_1, { kinds: [0, 1], authors: ['1'] }],
      [RELAY_2, { kinds: [0, 1], authors: ['1'] }],
      [RELAY_3, { kinds: [0, 1], authors: ['2'] }],
      [RELAY_4, { kinds: [0, 1], authors: ['2'] }],
      [RELAY_2, { kinds: [0, 1], authors: ['3'] }],
      [RELAY_3, { kinds: [0, 1], authors: ['3'] }],
      [RELAY_1, { kinds: [0, 1], authors: ['4'] }],
      [RELAY_4, { kinds: [0, 1], authors: ['4'] }],
    ])
  })

  test('assert ids', () => {
    const filters = { kinds: [0, 1], ids: ['1', '2', '3', '4'] }
    const hints = {
      ids: {
        '1': [RELAY_1, RELAY_2],
        '2': [RELAY_3, RELAY_4],
        '3': [RELAY_2, RELAY_3],
        '4': [RELAY_1, RELAY_4],
      },
    } as RelayHints

    const res = hintsToRelayFilters(filters, hints)
    expect(res).toStrictEqual([
      [RELAY_1, { kinds: [0, 1], ids: ['1'] }],
      [RELAY_2, { kinds: [0, 1], ids: ['1'] }],
      [RELAY_3, { kinds: [0, 1], ids: ['2'] }],
      [RELAY_4, { kinds: [0, 1], ids: ['2'] }],
      [RELAY_2, { kinds: [0, 1], ids: ['3'] }],
      [RELAY_3, { kinds: [0, 1], ids: ['3'] }],
      [RELAY_1, { kinds: [0, 1], ids: ['4'] }],
      [RELAY_4, { kinds: [0, 1], ids: ['4'] }],
    ])
  })

  test('assert addressable events', () => {
    const filters = {
      '#d': ['123'],
      authors: ['p1'],
      kinds: [39000],
    }
    const hints = {
      ids: {
        '39000:p1:123': ['wss://relay1.com'],
      },
    } as RelayHints
    const res = hintsToRelayFilters(filters, hints)
    expect(res).toStrictEqual([
      [
        'wss://relay1.com',
        {
          '#d': ['123'],
          authors: ['p1'],
          kinds: [39000],
        },
      ],
    ])
  })
})
