import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from 'utils/fixtures'
import { fromUserRelay } from '../fromUserRelays'
import { insertUserRelay } from '../insertUserRelay'

describe('fromUserRelay', () => {
  test('assert user relays', async () => {
    await insertUserRelay('1', [
      { type: 'nip65', pubkey: '1', permission: 'read', relay: RELAY_1 },
      { type: 'nip65', pubkey: '1', permission: 'write', relay: RELAY_2 },
      { type: 'nip65', pubkey: '1', permission: undefined, relay: RELAY_3 },
    ])
    await insertUserRelay('2', [
      { type: 'nip65', pubkey: '2', permission: undefined, relay: RELAY_1 },
      { type: 'nip65', pubkey: '2', permission: undefined, relay: RELAY_2 },
    ])

    const user1$ = fromUserRelay('1')
    const user2$ = fromUserRelay('2')

    const spy1 = subscribeSpyTo(user1$)
    const spy2 = subscribeSpyTo(user2$)

    await spy1.onComplete()
    await spy2.onComplete()
    expect(spy1.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_3]])
    expect(spy2.getValues()).toStrictEqual([[RELAY_1, RELAY_2]])
  })

  test('assert user read relays', async () => {
    await insertUserRelay('1', [
      { type: 'nip65', pubkey: '1', permission: 'read', relay: RELAY_1 },
      { type: 'nip65', pubkey: '1', permission: 'read', relay: RELAY_2 },
      { type: 'nip65', pubkey: '1', permission: 'write', relay: RELAY_3 },
      { type: 'nip65', pubkey: '1', permission: undefined, relay: RELAY_4 },
    ])

    const $ = fromUserRelay('1', {
      permission: 'read',
    })

    const spy = subscribeSpyTo($)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_4]])
  })

  test('assert user write relays', async () => {
    await insertUserRelay('1', [
      { type: 'nip65', pubkey: '1', permission: 'read', relay: RELAY_1 },
      { type: 'nip65', pubkey: '1', permission: 'write', relay: RELAY_2 },
      { type: 'nip65', pubkey: '1', permission: undefined, relay: RELAY_3 },
      { type: 'nip65', pubkey: '1', permission: undefined, relay: RELAY_4 },
    ])

    const $ = fromUserRelay('1', {
      permission: 'write',
    })

    const spy = subscribeSpyTo($)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[RELAY_2, RELAY_3, RELAY_4]])
  })
})
