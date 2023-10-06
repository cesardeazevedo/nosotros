import { RootStore } from 'stores/root.store'
import { fakeNote } from 'utils/faker'
import { NoteStore } from '../note.store'

describe('Test NoteStore', () => {
  let store: NoteStore

  beforeEach(() => {
    store = new NoteStore(new RootStore())
  })

  test('add()', async () => {
    const note = fakeNote({ id: '1' })
    await store.add(note)
    expect(store.notes.size).toBe(1)
    expect(store.notes.get('1')).toStrictEqual(note)
    expect(await store.notes.fetch('1')).toStrictEqual(note)
  })
})
