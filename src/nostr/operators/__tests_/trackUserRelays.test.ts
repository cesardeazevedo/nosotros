import { subscribeSpyTo } from '@hirez_io/observer-spy'
import type { UserRelayDB } from 'db/types'
import { of } from 'rxjs'
import { insertUserRelay } from '../insertUserRelay'
import { toRelayFilters, trackUserRelays, trackUsersRelays } from '../trackUserRelays'

describe('Track user relays', () => {
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
      [{ pubkey: '1', relay: 'relay1', type: 'nip65', permission: undefined }],
      [{ pubkey: '2', relay: 'relay2', type: 'nip65', permission: undefined }],
      [{ pubkey: '3', relay: 'relay3', type: 'nip65', permission: undefined }],
      [{ pubkey: '4', relay: 'relay4', type: 'nip65', permission: undefined }],
    ])
  })

  test('Assert toRelayFilters', async () => {
    const stream = of([
      { pubkey: '1', relay: 'relay1', type: 'nip65', permission: undefined },
      { pubkey: '1', relay: 'relay2', type: 'nip65', permission: undefined },
      { pubkey: '2', relay: 'relay2', type: 'nip65', permission: undefined },
      { pubkey: '3', relay: 'relay3', type: 'nip65', permission: undefined },
      { pubkey: '4', relay: 'relay4', type: 'nip65', permission: undefined },
      { pubkey: '5', relay: 'relay5', type: 'nip65', permission: undefined },
    ] as UserRelayDB[]).pipe(toRelayFilters({ kinds: [0], authors: [], limit: 1 }, 'authors'))

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
      [
        { pubkey: '1', relay: 'relay1', type: 'nip65', permission: undefined },
        { pubkey: '1', relay: 'relay2', type: 'nip65', permission: undefined },
        { pubkey: '1', relay: 'relay3', type: 'nip05', permission: undefined },
      ],
    ])
  })
})
