import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import { mergeRelayFilters } from '../mergeRelayFilters'

test('mergeRelayFilters', () => {
  const res = mergeRelayFilters([
    [RELAY_1, [{ ids: ['1'] }, { ids: ['2'] }]],
    [RELAY_2, [{ ids: ['3'] }, { ids: ['4'] }]],
    [RELAY_2, [{}, {}]],
    [RELAY_1, [{ ids: ['3'] }, { ids: ['4'] }, { authors: ['1'] }]],
    [RELAY_2, [{}, {}]],
    [RELAY_3, [{}, {}]],
    [RELAY_2, [{ ids: ['5'] }]],
  ])
  expect(res).toStrictEqual([
    [RELAY_1, [{ ids: ['1', '2', '3', '4'] }, { authors: ['1'] }]],
    [RELAY_2, [{ ids: ['3', '4', '5'] }]],
  ])
})
