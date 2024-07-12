import { subscribeSpyTo } from "@hirez_io/observer-spy"
import { insertUserRelay } from "../insertUserRelay"
import { trackUserRelays } from "../trackUserRelays"
import { map } from "rxjs"
import type { UserRelayDB } from "db/types"


// Just to make easy assertion
const toRelay = (pubkey: string) => (data: Record<string, UserRelayDB[]>) => {
  return { [pubkey]: data[pubkey].map((x) => x.relay) }
}

describe('Track user relays', () => {
  test('Assert user relays that already exists in the database', async () => {
    const pubkey = '1'

    await insertUserRelay(pubkey, [
      { pubkey, relay: 'relay1', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay2', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay3', type: 'nip05', permission: undefined },
    ])

    const spy = subscribeSpyTo(trackUserRelays(pubkey).pipe(
      map(toRelay(pubkey))
    ))

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      { [pubkey]: ['relay1', 'relay2', 'relay3'] }
    ])
  })

  test('Assert relays that doesnt exists in the database yet', async () => {
    const pubkey = '1'

    // Start tracking
    const spy = subscribeSpyTo(trackUserRelays(pubkey).pipe(
      map(toRelay(pubkey))
    ))

    // Insert the relays after the tracking
    await insertUserRelay(pubkey, [
      { pubkey, relay: 'relay1', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay2', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay3', type: 'nip05', permission: undefined },
    ])

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      { [pubkey]: ['relay1', 'relay2', 'relay3'] }
    ])
  })

  test('Assert tracking relays from multiple users', async () => {
    const spy1 = subscribeSpyTo(trackUserRelays('1').pipe(map(toRelay('1'))))
    const spy2 = subscribeSpyTo(trackUserRelays('2').pipe(map(toRelay('2'))))
    const spy3 = subscribeSpyTo(trackUserRelays('3').pipe(map(toRelay('3'))))

    // Insert the relays after the tracking
    await insertUserRelay('3', [
      { pubkey: '3', relay: 'relay3', type: 'nip65', permission: undefined },
    ])
    await insertUserRelay('2', [
      { pubkey: '2', relay: 'relay2', type: 'nip65', permission: undefined },
    ])
    await insertUserRelay('1', [
      { pubkey: '1', relay: 'relay1', type: 'nip65', permission: undefined },
      { pubkey: '1', relay: 'relay2', type: 'nip65', permission: undefined },
      { pubkey: '1', relay: 'relay3', type: 'nip05', permission: undefined },
    ])

    await spy1.onComplete()
    await spy2.onComplete()
    await spy3.onComplete()
    expect(spy1.getValues()).toStrictEqual([{ '1': ['relay1', 'relay2', 'relay3'] }])
    expect(spy2.getValues()).toStrictEqual([{ '2': ['relay2'] }])
    expect(spy3.getValues()).toStrictEqual([{ '3': ['relay3'] }])
  })
})
