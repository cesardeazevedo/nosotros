import { RELAY_1, RELAY_2, RELAY_3, RELAY_4 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { from, mergeMap } from 'rxjs'
import { READ, WRITE } from '../../helpers/parseRelayList'
import { toArrayRelay, trackMailbox } from '../trackMailbox'

describe('trackMailboxes', () => {
  test('assert user relays', async ({ createContext, insertRelayList }) => {
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

    const ctx = createContext()
    const user1$ = trackMailbox('1', {}, ctx).pipe(toArrayRelay)
    const user2$ = trackMailbox('2', {}, ctx).pipe(toArrayRelay)

    const spy1 = subscribeSpyTo(user1$)
    const spy2 = subscribeSpyTo(user2$)

    await spy1.onComplete()
    await spy2.onComplete()
    expect(spy1.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_3]])
    expect(spy2.getValues()).toStrictEqual([[RELAY_1, RELAY_2]])
  })

  test('assert user read relays', async ({ createContext, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', RELAY_1, 'read'],
        ['r', RELAY_2, 'read'],
        ['r', RELAY_3, 'write'],
        ['r', RELAY_4],
      ],
    })

    const ctx = createContext()
    const $ = trackMailbox('1', { permission: READ }, ctx).pipe(toArrayRelay)

    const spy = subscribeSpyTo($)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_4]])
  })

  test('assert user write relays', async ({ createContext, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', RELAY_1, 'read'],
        ['r', RELAY_2, 'write'],
        ['r', RELAY_3],
        ['r', RELAY_4],
      ],
    })

    const ctx = createContext()
    const $ = trackMailbox('1', { permission: WRITE }, ctx).pipe(toArrayRelay)

    const spy = subscribeSpyTo($)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[RELAY_2, RELAY_3, RELAY_4]])
  })

  test('assert multiple users relays on the fly', async ({ createContext, insertRelayList }) => {
    const ctx = createContext({ relays: [RELAY_1] })
    const $ = from(['1', '2', '3', '4', '5']).pipe(mergeMap((x) => trackMailbox(x, { timeout: 1000 }, ctx)))
    const spy = subscribeSpyTo($)

    await insertRelayList({ id: '1', pubkey: '1', tags: [['r', RELAY_1]] })
    await insertRelayList({ id: '2', pubkey: '2', tags: [['r', RELAY_2]] })
    await insertRelayList({ id: '3', pubkey: '3', tags: [['r', RELAY_3]] })
    await insertRelayList({ id: '4', pubkey: '4', tags: [['r', RELAY_4]] })
    // user 5 relay is missing, let the timeout close the stream

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [{ pubkey: '1', relay: RELAY_1, permission: READ | WRITE }],
      [{ pubkey: '2', relay: RELAY_2, permission: READ | WRITE }],
      [{ pubkey: '3', relay: RELAY_3, permission: READ | WRITE }],
      [{ pubkey: '4', relay: RELAY_4, permission: READ | WRITE }],
    ])
  })

  test('assert cache stream', async ({ createContext, insertRelayList }) => {
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
    const ctx = createContext()
    const $1 = from(['1', '2', '3']).pipe(mergeMap((x) => trackMailbox(x, { permission: READ, timeout: 1 }, ctx)))
    const spy1 = subscribeSpyTo($1)
    await spy1.onComplete()
    expect(spy1.getValues()).toStrictEqual([
      [
        { pubkey: '1', relay: RELAY_1, permission: READ },
        { pubkey: '1', relay: RELAY_3, permission: READ | WRITE },
      ],
      [
        { pubkey: '2', relay: RELAY_2, permission: READ },
        { pubkey: '2', relay: RELAY_3, permission: READ | WRITE },
      ],
    ])
    // We should make sure the selectRelays result doesn't get cached
    const $2 = from(['1', '2', '3']).pipe(mergeMap((x) => trackMailbox(x, { permission: WRITE, timeout: 1 }, ctx)))
    const spy2 = subscribeSpyTo($2)
    await spy2.onComplete()
    expect(spy2.getValues()).toStrictEqual([
      [
        { pubkey: '1', relay: RELAY_2, permission: WRITE },
        { pubkey: '1', relay: RELAY_3, permission: READ | WRITE },
      ],
      [
        { pubkey: '2', relay: RELAY_1, permission: WRITE },
        { pubkey: '2', relay: RELAY_3, permission: READ | WRITE },
      ],
    ])
  })
})
