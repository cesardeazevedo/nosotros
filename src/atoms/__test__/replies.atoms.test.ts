import { Kind } from '@/constants/kinds'
import { fakeEventMeta } from '@/utils/faker'
import { createStore } from 'jotai'
import { addReplyAtom, childrenAtomFamily, repliesLeftAtomFamily, replyCountAtomFamily } from '../repliesCount.atoms'

describe('replies atoms', () => {
  test('adds replies, dedupes, counts recursively, and computes remaining beyond limit', () => {
    const store = createStore()

    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', tags: [] })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p2', tags: [['e', '1', '', 'root']] })
    const e3 = fakeEventMeta({
      id: '3',
      kind: Kind.Text,
      pubkey: 'p1',
      tags: [
        ['e', '1', '', 'root'],
        ['e', '2', '', 'reply'],
      ],
    })
    const e4 = fakeEventMeta({
      id: '4',
      kind: Kind.Text,
      pubkey: 'p1',
      tags: [
        ['e', '1', '', 'root'],
        ['e', '3', '', 'reply'],
      ],
    })
    const e5 = fakeEventMeta({ id: '5', kind: Kind.Text, pubkey: 'p1', tags: [['e', '1', '', 'root']] })

    store.set(addReplyAtom, e1)
    store.set(addReplyAtom, e2)
    store.set(addReplyAtom, e3)
    store.set(addReplyAtom, e4)
    store.set(addReplyAtom, e5)

    expect([...store.get(childrenAtomFamily('1'))]).toEqual(['2', '5'])
    expect([...store.get(childrenAtomFamily('2'))]).toEqual(['3'])
    expect([...store.get(childrenAtomFamily('3'))]).toEqual(['4'])

    expect(store.get(replyCountAtomFamily('1'))).toBe(4)
    expect(store.get(replyCountAtomFamily('2'))).toBe(2)
    expect(store.get(replyCountAtomFamily('3'))).toBe(1)
    expect(store.get(replyCountAtomFamily('4'))).toBe(0)
    expect(store.get(replyCountAtomFamily('5'))).toBe(0)

    expect(store.get(repliesLeftAtomFamily({ id: '1', limit: 0 }))).toBe(4)
    expect(store.get(repliesLeftAtomFamily({ id: '1', limit: 1 }))).toBe(1)
    expect(store.get(repliesLeftAtomFamily({ id: '1', limit: 2 }))).toBe(0)
  })
})
