import { subscribeSpyTo } from "@hirez_io/observer-spy"
import { RELAY_1, RELAY_2, RELAY_3 } from "utils/fixtures"
import { fromUserRelay } from "../fromUserRelays"
import { insertUserRelay } from "../insertUserRelay"
import { map } from "rxjs"

test('fromRelayAuthors', async () => {
  await insertUserRelay('1', [
    { type: 'nip65', pubkey: '1', permission: undefined, relay: RELAY_1 },
    { type: 'nip65', pubkey: '1', permission: undefined, relay: RELAY_2 },
    { type: 'nip65', pubkey: '1', permission: undefined, relay: RELAY_3 },
  ])
  await insertUserRelay('2', [
    { type: 'nip65', pubkey: '2', permission: undefined, relay: RELAY_1 },
    { type: 'nip65', pubkey: '2', permission: undefined, relay: RELAY_2 },
  ])

  const user1$ = fromUserRelay('1').pipe(map((x) => x.map((x) => x.relay)))
  const user2$ = fromUserRelay('2').pipe(map((x) => x.map((x) => x.relay)))

  const spy1 = subscribeSpyTo(user1$)
  const spy2 = subscribeSpyTo(user2$)

  await spy1.onComplete()
  await spy2.onComplete()
  expect(spy1.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_3]])
  expect(spy2.getValues()).toStrictEqual([[RELAY_1, RELAY_2]])
})
