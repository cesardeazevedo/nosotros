import { RELAY_1, RELAY_2 } from "utils/fixtures"
import { mergeRelayFilters } from "../mergeRelayFilters"

test('mergeRelayFilters', () => {
  const res = mergeRelayFilters([{
    [RELAY_1]: [{ ids: ['1'] }, { ids: ['2'] }],
    [RELAY_2]: [{}, {}],
  }])
  expect(res).toStrictEqual({ [RELAY_1]: [{ ids: ['1', '2'] }] })
})
