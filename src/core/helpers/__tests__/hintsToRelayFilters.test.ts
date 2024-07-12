import type { RelayHints } from "core/types"
import { hintsToRelayFilters } from "../hintsToRelayFilters"
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from "utils/fixtures"

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
  expect(res).toStrictEqual(
    {
      'wss://relay1.com': [
        { authors: ['1', '4'], kinds: [0] },
        { authors: ['1', '4'], kinds: [1] },
      ],
      'wss://relay2.com': [
        { authors: ['1', '3'], kinds: [0] },
        { authors: ['1', '3'], kinds: [1] },
      ],
      'wss://relay3.com': [
        { authors: ['2', '3'], kinds: [0] },
        { authors: ['2', '3'], kinds: [1] },
      ],
      'wss://relay4.com': [
        { authors: ['2', '4'], kinds: [0] },
        { authors: ['2', '4'], kinds: [1] },
      ],
    }
  )
})
