import { Kind } from '@/constants/kinds'
import { db } from '@/nostr/db'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { from } from 'rxjs'
import { fakeNote } from 'utils/faker'
import { insertEvent, query } from '../localDB'

describe('localDB', () => {
  test('query()', async () => {
    const note1 = fakeNote({ id: '1', created_at: 1, kind: Kind.Text, pubkey: '1' })
    const note2 = fakeNote({ id: '2', created_at: 2, kind: Kind.Text, pubkey: '1' })
    const note3 = fakeNote({ id: '3', created_at: 3, kind: Kind.Text, pubkey: '2' })
    await db.event.insert(note1)
    await db.event.insert(note2)
    await db.event.insert(note3)

    const $ = query([{ kinds: [Kind.Text], authors: ['1'] }])

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([note2, note1])
  })

  test('insertEvent()', async () => {
    const note1 = fakeNote({ kind: 0, id: '1', pubkey: '1', created_at: 5 })
    const note2 = fakeNote({ kind: 0, id: '2', pubkey: '1', created_at: 10 })
    const note3 = fakeNote({ kind: 0, id: '3', pubkey: '1', created_at: 8 }) // old created_at, ignored
    const note4 = fakeNote({ kind: 0, id: '4', pubkey: '1', created_at: 15 })

    const $ = from([note1, note2, note3, note4]).pipe(insertEvent())

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([note1, note2, note4])
  })
})
