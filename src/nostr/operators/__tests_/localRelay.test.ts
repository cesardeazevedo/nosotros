import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { NostrSubscription } from '@/core/NostrSubscription'
import { Pool } from '@/core/pool'
import { fakeNote } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { expectRelayPublish, relaySendOK } from '@/utils/testHelpers'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { from } from 'rxjs'
import { insertEvent, query } from '../localRelay'

describe('localRelay', () => {
  test('query()', async ({ createMockRelay }) => {
    const note1 = fakeNote({ id: '1', created_at: 1, kind: Kind.Text, pubkey: '1' })
    const note2 = fakeNote({ id: '2', created_at: 2, kind: Kind.Text, pubkey: '1' })
    const relay = createMockRelay(RELAY_1, [note1, note2])

    const sub = new NostrSubscription({ kinds: [Kind.Text], authors: ['1'] })
    const pool = new Pool()
    const $ = query(pool, [RELAY_1], sub)

    const spy = subscribeSpyTo($)

    await spy.onComplete()
    await relay.close()
    expect(relay.received).toStrictEqual([['REQ', '1', { kinds: [Kind.Text], authors: ['1'] }]])
    expect(spy.getValues()).toStrictEqual([note1, note2])
  })

  test('insertEvent()', async ({ relay }) => {
    const note1 = fakeNote({ kind: 0, id: '1', pubkey: '1', created_at: 5 })
    const note2 = fakeNote({ kind: 0, id: '2', pubkey: '1', created_at: 10 })
    const note3 = fakeNote({ kind: 0, id: '3', pubkey: '1', created_at: 8 }) // old created_at, ignored
    const note4 = fakeNote({ kind: 0, id: '4', pubkey: '1', created_at: 15 })

    const pool = new Pool()
    const $ = from([note1, note2, note3, note4]).pipe(insertEvent(pool, [RELAY_1]))

    const spy = subscribeSpyTo($)
    await expectRelayPublish(relay, note1)
    await expectRelayPublish(relay, note2)
    await expectRelayPublish(relay, note3)
    await expectRelayPublish(relay, note4)

    relaySendOK(relay, [note1.id, true, ''])
    relaySendOK(relay, [note2.id, true, ''])
    relaySendOK(relay, [note3.id, true, ''])
    relaySendOK(relay, [note4.id, true, ''])
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([note1, note2, note3, note4])
  })
})
