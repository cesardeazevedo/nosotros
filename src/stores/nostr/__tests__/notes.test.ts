import type { NostrEvent } from 'core/types'
import { parseNote } from 'nostr/nips/nip01/metadata/parseNote'
import Note from 'stores/models/note'
import { fakeNote } from 'utils/faker'
import { test } from 'utils/fixtures'
import { NoteStore } from '../notes.store'
import { NostrClient } from 'nostr/nostr'

const getNote = (event: Partial<NostrEvent>) => new Note(parseNote(fakeNote(event)), new NostrClient())

describe('NoteStore', () => {
  test('Should add a note and expect on the notes store', () => {
    const note = getNote({ id: '1' })
    const store = new NoteStore()
    store.add(note)
    store.add(note)
    expect(store.notes.size).toBe(1)
    expect(store.notes.get('1')?.id).toBe(note.id)

    const noteReply = getNote({ id: '2', tags: [['e', '1']] })
    const noteReply2 = getNote({ id: '3', tags: [['e', '1']] })
    store.add(noteReply)
    store.add(noteReply2)
    expect(store.notes.size).toBe(3)
    expect(store.notes.get('2')?.id).toBe(noteReply.id)
    expect(store.notes.get('3')?.id).toBe(noteReply2.id)
    expect(store.replies.get('1')).toStrictEqual([noteReply.id, noteReply2.id])
  })
})
