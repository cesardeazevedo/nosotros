import { parseNote } from '@/nostr/helpers/parseNote'
import { fakeNote } from '@/utils/faker'
import { NoteStore } from '../notes.store'

describe('NoteStore', () => {
  test('assert root note and replies', () => {
    const store = new NoteStore()
    const event1 = fakeNote({ id: '1' })
    const eventReply = fakeNote({ id: '2', tags: [['e', '1', '', 'root']] })
    const eventReply2 = fakeNote({ id: '3', tags: [['e', '1', '', 'reply']] })
    const eventReply3 = fakeNote({ id: '4', tags: [['e', '3', '', 'reply']] })
    const note1 = store.add(event1, parseNote(event1))
    store.add(eventReply, parseNote(eventReply))
    const note3 = store.add(eventReply2, parseNote(eventReply2))
    store.add(eventReply3, parseNote(eventReply3))
    expect(store.notes.size).toBe(4)
    expect(store.replies.size).toBe(2)
    expect(store.getReplies(note1)).toStrictEqual([eventReply.id, eventReply2.id])
    expect(store.getReplies(note3)).toStrictEqual([eventReply3.id])
  })

  test('assert root note and with `a` tag', () => {
    const store = new NoteStore()
    const event1 = fakeNote({ id: '1', kind: 30023, pubkey: '1', tags: [['d', 'key']] })
    const event2 = fakeNote({ id: '2', tags: [['a', '30023:1:key', '', 'root']] })
    const note1 = store.add(event1, parseNote(event1))
    store.add(event2, parseNote(event2))
    expect(store.notes.size).toBe(2)
    expect(store.addresses.size).toBe(1)
    expect(store.getReplies(note1)).toStrictEqual([event2.id])
  })
})
