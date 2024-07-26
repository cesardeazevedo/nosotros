import type { RelayHints } from 'core/types'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from 'utils/fixtures'
import { hintsToRelayFilters } from '../hintsToRelayFilters'

test('Assert hintsToRelayFilters', () => {
  const filters = [
    { kinds: [0], authors: ['1', '2', '3', '4'] },
    { kinds: [1], authors: ['1', '2', '3', '4'] },
  ]
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
    ['wss://relay1.com', [{ kinds: [0], authors: ['1'] }]],
    ['wss://relay2.com', [{ kinds: [0], authors: ['1'] }]],
    ['wss://relay3.com', [{ kinds: [0], authors: ['2'] }]],
    ['wss://relay4.com', [{ kinds: [0], authors: ['2'] }]],
    ['wss://relay2.com', [{ kinds: [0], authors: ['3'] }]],
    ['wss://relay3.com', [{ kinds: [0], authors: ['3'] }]],
    ['wss://relay1.com', [{ kinds: [0], authors: ['4'] }]],
    ['wss://relay4.com', [{ kinds: [0], authors: ['4'] }]],
    ['wss://relay1.com', [{ kinds: [1], authors: ['1'] }]],
    ['wss://relay2.com', [{ kinds: [1], authors: ['1'] }]],
    ['wss://relay3.com', [{ kinds: [1], authors: ['2'] }]],
    ['wss://relay4.com', [{ kinds: [1], authors: ['2'] }]],
    ['wss://relay2.com', [{ kinds: [1], authors: ['3'] }]],
    ['wss://relay3.com', [{ kinds: [1], authors: ['3'] }]],
    ['wss://relay1.com', [{ kinds: [1], authors: ['4'] }]],
    ['wss://relay4.com', [{ kinds: [1], authors: ['4'] }]],
  ])
})
