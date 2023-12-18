import { Kind } from 'constants/kinds'
import { nip19 } from 'nostr-tools'
import { fakeNote, fakeSignature } from 'utils/faker'
import { RELAY_2, RELAY_3, test } from 'utils/fixtures'
import { expectMessage, sendMessages } from 'utils/testHelpers'
import { vi } from 'vitest'

describe('Test NoteStore', () => {
  test('Should add a note and expect on the notes store', async ({ root, createNote }) => {
    const note = createNote({ id: '1' })
    const store = root.notes
    store.add(note)
    store.add(note)
    expect(store.notes.size).toBe(1)
    expect(store.notes.get('1')?.id).toBe(note.id)
    expect((await store.notes.fetch('1'))?.id).toBe(note.id)
  })

  test('Should add a reply note and expect on the notes store', async ({ root, createNote }) => {
    const reply = createNote({ id: '2', tags: [['e', '1']] })
    const store = root.notes
    expect(store.replies.size).toBe(0)
    await store.addReply(reply)
    expect(store.replies.size).toBe(1)
    expect(store.replies.get(reply.parentNoteId)?.id).toBe(reply.parentNoteId)
    expect(store.replies.get(reply.parentNoteId)?.replies).toStrictEqual([reply.id])
  })

  test('Should test related notes', async ({ relays, root, createFilter }) => {
    const [relay1] = relays
    const store = root.notes
    const filter = createFilter({ authors: ['1'] })
    const sub = store.subscribe(filter)
    const stub = vi.fn()
    sub.subscribe((posts) => {
      stub(posts)
    })
    const reqId = await expectMessage(relay1, filter.data)
    const reply2 = fakeNote({ id: '3', pubkey: '1', tags: [['e', '2']] })
    await sendMessages(relay1, reqId, [reply2])
    expect(store.replies.size).toBe(1)
    expect(store.replies.get('2')?.replies).toStrictEqual(['3'])
    expect(stub).toHaveBeenCalledTimes(1)
    expect(stub.mock.calls.flat(Infinity)[0].id).toBe(reply2.id)

    const reqId2 = await expectMessage(
      relay1,
      { authors: ['1'], kinds: [Kind.Metadata, Kind.RelayList] },
      { ids: ['2'] },
    )
    const reply1 = fakeNote({ id: '2', pubkey: '2', tags: [['e', '1']] })
    await sendMessages(relay1, reqId2, [reply1])
    expect(store.replies.get('1')?.replies).toStrictEqual(['2'])
    expect(stub).toHaveBeenCalledTimes(2)
    expect(stub.mock.calls.flat(Infinity)[1].id).toBe(reply1.id)

    const reqId3 = await expectMessage(
      relay1,
      { authors: ['2'], kinds: [Kind.Metadata, Kind.RelayList] },
      { ids: ['1'] },
    )
    const rootNote = fakeNote({ id: '1', pubkey: '3', tags: [] })
    await sendMessages(relay1, reqId3, [rootNote])
    await expectMessage(relay1, { authors: ['3'], kinds: [Kind.Metadata, Kind.RelayList] })
    expect(stub).toHaveBeenCalledTimes(3)
    expect(stub.mock.calls.flat(Infinity)[2].id).toBe(rootNote.id)
  })

  test('Should test  subNotesRelated function and assert its ids', async ({ root, relays, createNote }) => {
    const [relay1, relay2, relay3] = relays
    const store = root.notes
    const neventNote = fakeSignature(fakeNote({}))
    const nevent = nip19.neventEncode({
      id: neventNote.id,
      relays: [RELAY_3],
    })
    const notes = [
      createNote({ id: '1', pubkey: '2', tags: [['e', '10', RELAY_2]] }),
      createNote({ id: '2', pubkey: '2', tags: [['e', '11', RELAY_2]] }),
      createNote({ id: '3', pubkey: '2', tags: [['e', '12', RELAY_3]] }),
      createNote({ id: '4', pubkey: '2', tags: [], content: `nostr:${nevent}` }),
    ]
    store.subNotesRelated(notes)

    await expectMessage(relay1, { ids: ['10', '11', '12', neventNote.id] })
    await expectMessage(relay2, { ids: ['10', '11'] })
    await expectMessage(relay3, { ids: ['12', neventNote.id] })
  })
})
