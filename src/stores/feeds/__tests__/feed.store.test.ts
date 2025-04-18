import { fakeEventMeta } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { FeedStoreModel } from '../feed.store'

describe('FeedStore', () => {
  test('assert flush', () => {
    const store = FeedStoreModel.create({
      filter: { kinds: [1], authors: ['1'] },
      context: {},
      scope: 'following',
    })
    const note1 = fakeEventMeta({ id: '1' })
    const note2 = fakeEventMeta({ id: '2' })
    const note3 = fakeEventMeta({ id: '3' })
    const note4 = fakeEventMeta({ id: '4' })
    const note5 = fakeEventMeta({ id: '5' })
    const note6 = fakeEventMeta({ id: '6' })
    const note7 = fakeEventMeta({ id: '7' })
    const note8 = fakeEventMeta({ id: '8' })
    const note9 = fakeEventMeta({ id: '9' })
    store.add(note1)
    store.add(note2)
    store.add(note3)
    expect(store.list).toStrictEqual([note1, note2, note3])
    store.addBuffer(note4)
    store.addBuffer(note5)
    store.addBuffer(note6)
    expect(store.list).toStrictEqual([note1, note2, note3])
    expect(store.buffer).toHaveLength(3)
    expect(store.latest).toHaveLength(0)
    store.flush()
    expect(store.list).toStrictEqual([note4, note5, note6, note1, note2, note3])
    expect(store.buffer).toHaveLength(0)
    expect(store.latest).toHaveLength(3)
    store.addBuffer(note7)
    store.addBuffer(note8)
    store.addBuffer(note9)
    expect(store.buffer).toHaveLength(3)
    store.flush()
    expect(store.list).toStrictEqual([note7, note8, note9, note4, note5, note6, note1, note2, note3])
    expect(store.buffer).toHaveLength(0)
    expect(store.latest).toHaveLength(6)
  })
})
