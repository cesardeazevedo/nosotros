import { Kind } from '@/constants/kinds'
import { db } from '@/nostr/db'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { from } from 'rxjs'
import { fakeEvent } from 'utils/faker'
import { insertDB } from '../insertDB'
import { queryDB } from '../../db/queryDB'

describe('localDB', () => {
  test('query()', async () => {
    const note1 = fakeEvent({ id: '1', created_at: 1, pubkey: '1' })
    const note2 = fakeEvent({ id: '2', created_at: 2, pubkey: '1' })
    const note3 = fakeEvent({ id: '3', created_at: 3, pubkey: '2' })
    await db.event.insert(note1)
    await db.event.insert(note2)
    await db.event.insert(note3)

    const $ = queryDB([{ kinds: [Kind.Text], authors: ['1'] }])

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([note2, note1])
  })

  test('query with limit()', async () => {
    const note1 = fakeEvent({ id: '1', created_at: 1, pubkey: '1' })
    const note2 = fakeEvent({ id: '2', created_at: 2, pubkey: '1' })
    const note3 = fakeEvent({ id: '3', created_at: 3, pubkey: '1' })
    const note4 = fakeEvent({ id: '4', created_at: 4, pubkey: '1' })
    const note5 = fakeEvent({ id: '5', created_at: 5, pubkey: '1' })
    await db.event.insert(note1)
    await db.event.insert(note2)
    await db.event.insert(note3)
    await db.event.insert(note4)
    await db.event.insert(note5)

    const $ = queryDB([{ kinds: [Kind.Text], authors: ['1'], limit: 3 }])

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([note5, note4, note3])
  })

  test('insertEvent()', async () => {
    const note1 = fakeEvent({ kind: 0, id: '1', pubkey: '1', created_at: 5 })
    const note2 = fakeEvent({ kind: 0, id: '2', pubkey: '1', created_at: 10 })
    const note3 = fakeEvent({ kind: 0, id: '3', pubkey: '1', created_at: 8 }) // old created_at, ignored
    const note4 = fakeEvent({ kind: 0, id: '4', pubkey: '1', created_at: 15 })

    const $ = from([note1, note2, note3, note4]).pipe(insertDB())

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([note1, note2, note4])
  })
})
