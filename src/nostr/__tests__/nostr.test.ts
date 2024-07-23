import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { Pool } from 'core/pool'
import { NostrClient } from 'nostr/nostr'
import { insertUserRelay } from 'nostr/operators/insertUserRelay'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, test } from 'utils/fixtures'
import { expectRelayReceived, relaySendEose, relaySendEvents } from 'utils/testHelpers'

describe('NostrClient', () => {
  test('Assert pubkey relays', async () => {
    const pubkey = '1'
    await insertUserRelay(pubkey, [
      { pubkey, relay: 'relay1', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay2', type: 'nip65', permission: undefined },
      { pubkey, relay: 'relay3', type: 'nip05', permission: undefined },
      { pubkey, relay: 'relay4', type: 'nip05', permission: undefined },
      { pubkey, relay: 'relay5', type: 'nip05', permission: undefined },
    ])

    const pool = new Pool()
    const client = new NostrClient(pool, { pubkey })

    const spy = subscribeSpyTo(client.relays$)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([['relay1', 'relay2', 'relay3', 'relay4', 'relay5']])
  })

  test('(outbox) assert authors relay', async ({ relay, relay2, relay3, relay4 }) => {
    const pubkey1 = '1'
    const pubkey2 = '2'
    const pubkey3 = '3'
    // All the first relay_1 here will be ignore since it's already on the client.relays
    await insertUserRelay(pubkey1, [
      { pubkey: pubkey1, relay: RELAY_1, type: 'nip65', permission: undefined },
      { pubkey: pubkey1, relay: RELAY_2, type: 'nip65', permission: undefined },
    ])
    await insertUserRelay(pubkey2, [
      { pubkey: pubkey2, relay: RELAY_1, type: 'nip05', permission: undefined },
      { pubkey: pubkey2, relay: RELAY_3, type: 'nip05', permission: undefined },
    ])
    await insertUserRelay(pubkey3, [
      { pubkey: pubkey3, relay: RELAY_1, type: 'nip05', permission: undefined },
      { pubkey: pubkey3, relay: RELAY_4, type: 'nip05', permission: undefined },
    ])

    const pool = new Pool()
    const client = new NostrClient(pool, {
      relays: [RELAY_1],
      settings: {
        maxRelaysPerUser: 1,
      },
    })

    const sub = client.subscribe({ kinds: [0], authors: ['1', '2', '3'] })

    const $ = pool.subscribe(sub)

    const spy = subscribeSpyTo($)

    const reqId = sub.id

    await expectRelayReceived(relay, { kinds: [0], authors: ['1', '2', '3'] })
    await expectRelayReceived(relay2, { kinds: [0], authors: ['1'] })
    await expectRelayReceived(relay3, { kinds: [0], authors: ['2'] })
    await expectRelayReceived(relay4, { kinds: [0], authors: ['3'] })

    relaySendEvents(relay, reqId, ['1'])
    relaySendEvents(relay2, reqId, ['2'])
    relaySendEvents(relay3, reqId, ['3'])
    relaySendEvents(relay4, reqId, ['4'])

    relaySendEose(relay, reqId)
    relaySendEose(relay2, reqId)
    relaySendEose(relay3, reqId)
    relaySendEose(relay4, reqId)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, '1'],
      [RELAY_2, '2'],
      [RELAY_3, '3'],
      [RELAY_4, '4'],
    ])
  })

  test('(outbox) assert outbox authors from #p tags', async ({ relay, relay2, relay3, relay4 }) => {
    const pubkey1 = '1'
    const pubkey2 = '2'
    await insertUserRelay(pubkey1, [
      { pubkey: pubkey1, relay: RELAY_1, type: 'nip65', permission: undefined },
      { pubkey: pubkey1, relay: RELAY_2, type: 'nip65', permission: undefined },
    ])
    await insertUserRelay(pubkey2, [
      { pubkey: pubkey2, relay: RELAY_3, type: 'nip05', permission: undefined },
      { pubkey: pubkey2, relay: RELAY_4, type: 'nip05', permission: undefined },
    ])

    const pool = new Pool()
    const client = new NostrClient(pool, {
      settings: {
        maxRelaysPerUser: 2,
      },
    })

    const sub = client.subscribe({ kinds: [0], '#p': ['1', '2', '3'] })

    const reqId = sub.id

    const $ = pool.subscribe(sub)

    const spy = subscribeSpyTo($)

    await expectRelayReceived(relay, { kinds: [0], '#p': ['1'] })
    await expectRelayReceived(relay2, { kinds: [0], '#p': ['1'] })
    await expectRelayReceived(relay3, { kinds: [0], '#p': ['2'] })
    await expectRelayReceived(relay4, { kinds: [0], '#p': ['2'] })

    relaySendEvents(relay, reqId, ['1'])
    relaySendEvents(relay2, reqId, ['2'])
    relaySendEvents(relay3, reqId, ['3'])
    relaySendEvents(relay4, reqId, ['4'])

    relaySendEose(relay, reqId)
    relaySendEose(relay2, reqId)
    relaySendEose(relay3, reqId)
    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, '1'],
      [RELAY_2, '2'],
      [RELAY_3, '3'],
      [RELAY_4, '4'],
    ])
  })

  test('(outbox) assert outbox authors with relays on the fly', async ({ relay, relay2 }) => {
    const pool = new Pool()
    const client = new NostrClient(pool, {
      settings: {
        maxRelaysPerUser: 2,
      },
    })

    const sub = client.subscribe({ kinds: [0], authors: ['1', '2'] })

    const reqId = sub.id

    const $ = pool.subscribe(sub)

    const spy = subscribeSpyTo($)

    const pubkey1 = '1'
    await insertUserRelay(pubkey1, [
      { pubkey: pubkey1, relay: RELAY_1, type: 'nip65', permission: undefined },
      { pubkey: pubkey1, relay: RELAY_2, type: 'nip65', permission: undefined },
    ])
    await expectRelayReceived(relay, { kinds: [0], authors: ['1'] })
    await expectRelayReceived(relay2, { kinds: [0], authors: ['1'] })
    relaySendEose(relay, reqId)
    relaySendEose(relay2, reqId)
    expect(spy.getValues()).toStrictEqual([])
  })
})
