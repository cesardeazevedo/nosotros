import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { NostrSubscription } from '@/core/NostrSubscription'
import { Pool } from '@/core/pool'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { from } from 'rxjs'
import { queryLocalRelay } from '../../db/queryLocalRelay'
import { insertLocalRelay } from '../insertLocalRelay'

describe('localRelay', () => {
  test('query()', async ({ createMockRelay }) => {
    const note1 = fakeEvent({ id: '1', created_at: 1, kind: Kind.Text, pubkey: '1' })
    const note2 = fakeEvent({ id: '2', created_at: 2, kind: Kind.Text, pubkey: '1' })
    const relay = createMockRelay(RELAY_1, [note1, note2])

    const sub = new NostrSubscription({ kinds: [Kind.Text], authors: ['1'] })
    const $ = queryLocalRelay([RELAY_1], sub)

    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay.close()
    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [Kind.Text], authors: ['1'] }],
      ['CLOSE', '1'],
    ])
    expect(spy.getValues()).toStrictEqual([note1, note2])
  })

  test('insertEvent()', async ({ createMockRelay }) => {
    const note1 = fakeEvent({ kind: 0, id: '1', pubkey: '1', created_at: 5 })
    const note2 = fakeEvent({ kind: 0, id: '2', pubkey: '1', created_at: 10 })
    const note3 = fakeEvent({ kind: 0, id: '3', pubkey: '1', created_at: 8 }) // old created_at, ignored
    const note4 = fakeEvent({ kind: 0, id: '4', pubkey: '1', created_at: 15 })
    const relay = createMockRelay(RELAY_1, [])

    const pool = new Pool()
    const $ = from([note1, note2, note3, note4]).pipe(insertLocalRelay(pool, [RELAY_1]))

    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay.close()

    expect(relay.received).toStrictEqual([
      ['EVENT', note1],
      ['EVENT', note2],
      ['EVENT', note3],
      ['EVENT', note4],
    ])
    expect(spy.getValues()).toStrictEqual([note1, note2, note3, note4])
  })
})
