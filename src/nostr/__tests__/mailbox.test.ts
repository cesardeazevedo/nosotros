import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { from, mergeMap } from 'rxjs'
import { Mailbox, toArrayRelay } from '../mailbox'
import { READ, WRITE } from '../nips/nip65.relaylist'

describe('Mailbox Tracker', () => {
  test('assert user relays', async ({ createClient, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', RELAY_1, 'read'],
        ['r', RELAY_2, 'write'],
        ['r', RELAY_3],
      ],
    })
    await insertRelayList({
      pubkey: '2',
      tags: [
        ['r', RELAY_1],
        ['r', RELAY_2],
      ],
    })

    const client = createClient()
    const user1$ = client.mailbox.track('1').pipe(toArrayRelay)
    const user2$ = client.mailbox.track('2').pipe(toArrayRelay)

    const spy1 = subscribeSpyTo(user1$)
    const spy2 = subscribeSpyTo(user2$)

    await spy1.onComplete()
    await spy2.onComplete()
    expect(spy1.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_3]])
    expect(spy2.getValues()).toStrictEqual([[RELAY_1, RELAY_2]])
  })

  test('assert user read relays', async ({ createClient, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', RELAY_1, 'read'],
        ['r', RELAY_2, 'read'],
        ['r', RELAY_3, 'write'],
        ['r', RELAY_4],
      ],
    })

    const client = createClient()
    const $ = client.mailbox.track('1', { permission: READ }).pipe(toArrayRelay)

    const spy = subscribeSpyTo($)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_4]])
  })

  test('assert user write relays', async ({ createClient, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', RELAY_1, 'read'],
        ['r', RELAY_2, 'write'],
        ['r', RELAY_3],
        ['r', RELAY_4],
      ],
    })

    const client = createClient()
    const mailbox = new Mailbox(client)
    const $ = mailbox.track('1', { permission: WRITE }).pipe(toArrayRelay)

    const spy = subscribeSpyTo($)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[RELAY_2, RELAY_3, RELAY_4]])
  })

  test('assert multiple users relays on the fly', async ({ createClient, insertRelayList }) => {
    const client = createClient({ relays: [RELAY_1] })
    const $ = from(['1', '2', '3', '4', '5']).pipe(mergeMap((x) => client.mailbox.track(x, { timeout: 1000 })))
    const spy = subscribeSpyTo($)

    await insertRelayList({ id: '1', pubkey: '1', tags: [['r', 'relay1']] }, client)
    await insertRelayList({ id: '2', pubkey: '2', tags: [['r', 'relay2']] }, client)
    await insertRelayList({ id: '3', pubkey: '3', tags: [['r', 'relay3']] }, client)
    await insertRelayList({ id: '4', pubkey: '4', tags: [['r', 'relay4']] }, client)
    // user 5 relay is missing, let the timeout close the stream

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [{ pubkey: '1', relay: 'relay1', permission: undefined }],
      [{ pubkey: '2', relay: 'relay2', permission: undefined }],
      [{ pubkey: '3', relay: 'relay3', permission: undefined }],
      [{ pubkey: '4', relay: 'relay4', permission: undefined }],
    ])
  })

  test('assert cache stream', async ({ createClient, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', RELAY_1, 'read'],
        ['r', RELAY_2, 'write'],
        ['r', RELAY_3],
      ],
    })
    await insertRelayList({
      pubkey: '2',
      tags: [
        ['r', RELAY_1, 'write'],
        ['r', RELAY_2, 'read'],
        ['r', RELAY_3],
      ],
    })
    const client = createClient()
    const $1 = from(['1', '2', '3']).pipe(mergeMap((x) => client.mailbox.track(x, { permission: READ, timeout: 1 })))
    const spy1 = subscribeSpyTo($1)
    await spy1.onComplete()
    expect(spy1.getValues()).toStrictEqual([
      [
        { pubkey: '1', relay: RELAY_1, permission: 'read' },
        { pubkey: '1', relay: RELAY_3, permission: undefined },
      ],
      [
        { pubkey: '2', relay: RELAY_2, permission: 'read' },
        { pubkey: '2', relay: RELAY_3, permission: undefined },
      ],
    ])
    // We should make sure the selectRelays result doesn't get cached
    const $2 = from(['1', '2', '3']).pipe(mergeMap((x) => client.mailbox.track(x, { permission: WRITE, timeout: 1 })))
    const spy2 = subscribeSpyTo($2)
    await spy2.onComplete()
    expect(spy2.getValues()).toStrictEqual([
      [
        { pubkey: '1', relay: RELAY_2, permission: 'write' },
        { pubkey: '1', relay: RELAY_3, permission: undefined },
      ],
      [
        { pubkey: '2', relay: RELAY_1, permission: 'write' },
        { pubkey: '2', relay: RELAY_3, permission: undefined },
      ],
    ])
  })
})
