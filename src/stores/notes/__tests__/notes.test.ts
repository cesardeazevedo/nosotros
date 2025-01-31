import { test } from '@/utils/fixtures'
import { noteStore } from '../notes.store'

describe('NoteStore', () => {
  beforeEach(() => {
    noteStore.clear()
  })

  test('assert root note and replies', ({ createNote }) => {
    const note1 = createNote({ id: '1' })
    const note2 = createNote({ id: '2', tags: [['e', '1', '', 'root']] })
    const note3 = createNote({ id: '3', tags: [['e', '1', '', 'reply']] })
    const note4 = createNote({ id: '4', tags: [['e', '3', '', 'reply']] })

    expect(noteStore.replies.size).toBe(2)
    expect(noteStore.getReplies(note1.event)).toStrictEqual([note2.event, note3.event])
    expect(noteStore.getReplies(note3.event)).toStrictEqual([note4.event])
  })

  test('assert root note and with `a` tag', ({ createNote }) => {
    const note1 = createNote({ id: '1', kind: 30023, pubkey: '1', tags: [['d', 'key']] })
    const note2 = createNote({ id: '2', tags: [['a', '30023:1:key', '', 'root']] })
    expect(noteStore.getReplies(note1.event)).toStrictEqual([note2.event])
  })
})
