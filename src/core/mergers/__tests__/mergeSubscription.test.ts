import { NostrSubscription } from "core/NostrSubscription"
import { RELAY_1, RELAY_2 } from "utils/fixtures"
import { mergeSubscriptions } from "../mergeSubscription"

test('mergeSubscription', () => {
  const sub1 = new NostrSubscription({ ids: ['1'] }, { relayHints: { ids: { '1': [RELAY_1] } }, })
  const sub2 = new NostrSubscription({ ids: ['2'] }, { relayHints: { ids: { '2': [RELAY_2] } }, })
  const sub3 = new NostrSubscription({ ids: ['3'] }, { relayHints: {}, })

  const parent = mergeSubscriptions([sub1, sub2, sub3])

  expect(parent.filters).toStrictEqual(
    [
      {
        ids: [
          "1",
          "2",
          "3",
        ],
      },
    ]
  )

  expect(parent.relayHints).toStrictEqual(
    {
      ids: {
        "1": [
          "wss://relay1.com",
        ],
        "2": [
          "wss://relay2.com",
        ],
      },
    }
  )
})

