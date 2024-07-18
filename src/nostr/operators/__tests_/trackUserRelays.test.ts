import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { from } from 'rxjs'
import { insertUserRelay } from '../insertUserRelay'
import { toRelayFilters, trackUserRelays, trackUsersRelays } from '../trackUserRelays'

describe('Track user relays', () => {
  test('Assert user relays in the database', async () => {
    const pubkey = '1'

    await insertUserRelay(pubkey, [
      { pubkey, relay: 'relay1', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay2', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay3', type: 'nip05', permission: undefined },
    ])

    const spy = subscribeSpyTo(trackUserRelays(pubkey))

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[pubkey, ['relay1', 'relay2', 'relay3']]])
  })

  test('Assert multiple users relays in the database', async () => {
    await insertUserRelay('1', [{ pubkey: '1', relay: 'relay1', type: 'nip65', permission: undefined }])
    await insertUserRelay('2', [{ pubkey: '2', relay: 'relay2', type: 'nip65', permission: undefined }])
    await insertUserRelay('3', [{ pubkey: '3', relay: 'relay3', type: 'nip65', permission: undefined }])
    await insertUserRelay('4', [{ pubkey: '4', relay: 'relay4', type: 'nip65', permission: undefined }])
    await insertUserRelay('5', [{ pubkey: '5', relay: 'relay5', type: 'nip65', permission: undefined }])

    const spy = subscribeSpyTo(trackUsersRelays(['1', '2', '3', '4', '5']))

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      ['1', ['relay1']],
      ['2', ['relay2']],
      ['3', ['relay3']],
      ['4', ['relay4']],
      ['5', ['relay5']],
    ])
  })

  test('Assert multiple users relays on the fly', async () => {
    const spy = subscribeSpyTo(trackUsersRelays(['1', '2', '3', '4', '5'], { timeout: 1000 }))

    await insertUserRelay('1', [{ pubkey: '1', relay: 'relay1', type: 'nip65', permission: undefined }])
    await insertUserRelay('2', [{ pubkey: '2', relay: 'relay2', type: 'nip65', permission: undefined }])
    await insertUserRelay('3', [{ pubkey: '3', relay: 'relay3', type: 'nip65', permission: undefined }])
    await insertUserRelay('4', [{ pubkey: '4', relay: 'relay4', type: 'nip65', permission: undefined }])
    // user 5 relay is missing, let the timeout close the stream
    // await insertUserRelay('5', [{ pubkey: '5', relay: 'relay5', type: 'nip65', permission: undefined }])

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      ['1', ['relay1']],
      ['2', ['relay2']],
      ['3', ['relay3']],
      ['4', ['relay4']],
    ])
  })

  test('Assert toRelayFilters', async () => {
    const stream = from([
      ['1', ['relay1', 'relay2']],
      ['2', ['relay2']],
      ['3', ['relay3']],
      ['4', ['relay4']],
      ['5', ['relay5']],
    ] as [string, string[]][]).pipe(toRelayFilters({ kinds: [0], authors: [], limit: 1 }, 'authors'))

    const spy = subscribeSpyTo(stream)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      ['relay1', [{ kinds: [0], limit: 1, authors: ['1'] }]],
      ['relay2', [{ kinds: [0], limit: 1, authors: ['1'] }]],
      ['relay2', [{ kinds: [0], limit: 1, authors: ['2'] }]],
      ['relay3', [{ kinds: [0], limit: 1, authors: ['3'] }]],
      ['relay4', [{ kinds: [0], limit: 1, authors: ['4'] }]],
      ['relay5', [{ kinds: [0], limit: 1, authors: ['5'] }]],
    ])
  })

  test('Assert relays that doesnt exists in the database yet', async () => {
    const pubkey = '1'

    // Start tracking
    const spy = subscribeSpyTo(trackUserRelays(pubkey))

    // Insert the relays after the tracking
    await insertUserRelay(pubkey, [
      { pubkey, relay: 'relay1', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay2', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay3', type: 'nip05', permission: undefined },
    ])

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [pubkey, ['relay1', 'relay2', 'relay3']],
    ])
  })

  test('Assert tracking relays from multiple users', async () => {
    const spy1 = subscribeSpyTo(trackUserRelays('1'))
    const spy2 = subscribeSpyTo(trackUserRelays('2'))
    const spy3 = subscribeSpyTo(trackUserRelays('3'))

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
    expect(spy1.getValues()).toStrictEqual([['1', ['relay1', 'relay2', 'relay3']]])
    expect(spy2.getValues()).toStrictEqual([['2', ['relay2']]])
    expect(spy3.getValues()).toStrictEqual([['3', ['relay3']]])
  })
})
