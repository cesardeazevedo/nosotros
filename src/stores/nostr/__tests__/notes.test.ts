import { test } from 'utils/fixtures'
import { NoteStore } from '../notes.store'

describe('NoteStore', () => {
  test('Should add a note and expect on the notes store', ({ createNote }) => {
    const note = createNote({ id: '1' })
    const store = new NoteStore()
    store.add(note)
    store.add(note)
    expect(store.notes.size).toBe(1)
    expect(store.notes.get('1')?.id).toBe(note.id)

    const noteReply = createNote({ id: '2', tags: [['e', '1']] })
    const noteReply2 = createNote({ id: '3', tags: [['e', '1']] })
    store.add(noteReply)
    store.add(noteReply2)
    expect(store.notes.size).toBe(3)
    expect(store.notes.get('2')?.id).toBe(noteReply.id)
    expect(store.notes.get('3')?.id).toBe(noteReply2.id)
    expect(store.replies.get('1')).toStrictEqual([noteReply.id, noteReply2.id])
  })
})
