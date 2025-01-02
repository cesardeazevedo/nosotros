import { parseNote } from '@/nostr/nips/nip01/metadata/parseNote'
import { fakeNote } from '@/utils/faker'
import { NoteStore } from '../notes.store'

describe('NoteStore', () => {
  test('assert root note and replies', () => {
    const store = new NoteStore()
    const note = fakeNote({ id: '1' })
    const noteReply = fakeNote({ id: '2', tags: [['e', '1']] })
    const noteReply2 = fakeNote({ id: '3', tags: [['e', '1']] })
    const noteReply3 = fakeNote({ id: '4', tags: [['e', '3']] })
    store.add(note, parseNote(note))
    store.add(noteReply, parseNote(noteReply))
    store.add(noteReply2, parseNote(noteReply2))
    store.add(noteReply3, parseNote(noteReply3))
    expect(store.notes.size).toBe(4)
    expect(store.replies.size).toBe(2)
    expect(store.replies.get('1')).toStrictEqual([noteReply.id, noteReply2.id])
    expect(store.replies.get('3')).toStrictEqual([noteReply3.id])
  })
})
