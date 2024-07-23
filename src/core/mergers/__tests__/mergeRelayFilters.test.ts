import { RELAY_1, RELAY_2, RELAY_3 } from 'utils/fixtures'
import { mergeRelayFilters } from '../mergeRelayFilters'

test('mergeRelayFilters', () => {
  const res = mergeRelayFilters([
    [RELAY_1, [{ ids: ['1'] }, { ids: ['2'] }]],
    [RELAY_2, [{}, {}]],
    [RELAY_1, [{ ids: ['3'] }, { ids: ['4'] }, { authors: ['1'] }]],
    [RELAY_2, [{}, {}]],
    [RELAY_3, [{}, {}]],
  ])
  expect(res).toStrictEqual([[RELAY_1, [{ ids: ['1', '2', '3', '4'] }, { authors: ['1'] }]]])
})
