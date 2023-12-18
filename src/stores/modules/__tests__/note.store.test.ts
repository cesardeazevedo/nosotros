import { nip19 } from 'nostr-tools'
import { fakeNote, fakeSignature } from 'utils/faker'
import { RELAY_2, RELAY_3, test } from 'utils/fixtures'
import { Note } from '../note.store'

describe('Test noteStore', () => {
  test('Should expect isRoot true', ({ createNote }) => {
    const note = createNote({ id: '1', tags: [] })
    expect(note.isRoot).toBe(true)
    expect(note.rootNoteId).toBe('1')
  })

  test('Should assert rootNoteId', ({ createNote }) => {
    const note = createNote({
      id: '1',
      tags: [['e', '2']],
    })
    expect(note.isRoot).toBe(false)
    expect(note.isRootReply).toBe(true)
    expect(note.isReplyOfAReply).toBe(false)
    expect(note.rootNoteId).toBe('2')
  })

  test('Should expect isRoot with mention', ({ createNote }) => {
    const note = createNote({ id: '1', tags: [['e', '2', '', 'mention']] })
    expect(note.isRoot).toBe(true)
    expect(note.isRootReply).toBe(false)
    expect(note.isReplyOfAReply).toBe(false)
  })

  test('Should expect isRoot false and isRootReply true', ({ createNote }) => {
    const note = createNote({
      id: '1',
      tags: [
        ['e', '2'],
        ['e', '3', '', 'mention'],
      ],
    })
    expect(note.isRoot).toBe(false)
    expect(note.isRootReply).toBe(true)
    expect(note.rootNoteId).toBe('2')
    expect(note.parentNoteId).toBe('2')
  })

  test('Should expect isRootReply true and isReplyOfAReply false', ({ createNote }) => {
    const note = createNote({
      id: '1',
      tags: [
        ['e', '2'],
        ['e', '3', '', 'mention'],
      ],
    })
    expect(note.isRootReply).toBe(true)
    expect(note.isReplyOfAReply).toBe(false)
    expect(note.rootNoteId).toBe('2')
    expect(note.parentNoteId).toBe('2')
  })

  test('Should expect isRootReply false', ({ createNote }) => {
    const note = createNote({
      id: '1',
      tags: [
        ['e', '2'],
        ['e', '3'],
        ['e', '4', '', 'mention'],
      ],
    })
    expect(note.isRoot).toBe(false)
    expect(note.isRootReply).toBe(false)
    expect(note.isReplyOfAReply).toBe(true)
    expect(note.rootNoteId).toBe('2')
    expect(note.parentNoteId).toBe('3')
  })

  test('Should expect multiple replies and match isReplyOfAReply true', ({ createNote }) => {
    const note = createNote({
      id: '1',
      tags: [
        ['e', '2'],
        ['e', '3'],
        ['e', '4'],
        ['e', '5'],
        ['e', '6'],
        ['e', '7', '', 'mention'],
      ],
    })
    expect(note.isRoot).toBe(false)
    expect(note.isRootReply).toBe(false)
    expect(note.isReplyOfAReply).toBe(true)
    expect(note.rootNoteId).toBe('2')
    expect(note.parentNoteId).toBe('6')
  })

  test('Should expect mentionedNotes match with `e` mention tags', ({ createNote }) => {
    const note = createNote({
      id: '1',
      tags: [
        ['e', '0'],
        ['e', '2', '', 'mention'],
        ['e', '3', '', 'mention'],
        ['e', '4', '', 'mention'],
      ],
    })
    expect(note.mentionedNotes).toStrictEqual(['2', '3', '4'])
    expect(note.rootNoteId).toBe('0')
    expect(note.parentNoteId).toBe('0')
  })

  test('Should expect mentionedNotes match with nevent', ({ createNote }) => {
    const event = fakeSignature(fakeNote({ content: 'related' }))
    const encoded = nip19.neventEncode({
      id: event.id,
      author: event.pubkey,
      relays: [],
    })
    const note = createNote({
      id: '1',
      content: `hello nostr:${encoded}`,
      tags: [
        ['e', '1', '', 'mention'],
        ['q', '2'],
      ],
    })
    expect(note.mentionedNotes).toStrictEqual(['1', '2', event.id])
    expect(note.rootNoteId).toBe('1')
    expect(note.parentNoteId).toBeUndefined()
  })

  test('Should expect mentionedAuthors from a nevent encoded author', ({ createNote }) => {
    const encoded = nip19.neventEncode({
      id: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
      author: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
    })
    const note = createNote({
      id: '1',
      content: `hello nostr:${encoded}`,
      tags: [['p', '10']],
    })
    expect(note.mentionedAuthors).toStrictEqual([
      '1',
      '10',
      'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
    ])
  })

  test('Should expect mentionedAuthors match with nprofileEncode and `p` tags', ({ createNote }) => {
    const encoded = nip19.nprofileEncode({
      pubkey: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
      relays: [RELAY_2, RELAY_3],
    })
    const note = createNote({
      id: '1',
      content: `hello nostr:${encoded}`,
      tags: [
        ['p', '1'],
        ['p', '2'],
        ['p', '3'],
      ],
    })
    expect(note.mentionedAuthors).toStrictEqual([
      '1',
      '2',
      '3',
      'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
    ])
  })

  test('Should expect two relay hints merged', ({ createNote }) => {
    const notes = [
      createNote({
        tags: [
          ['e', '1', RELAY_2],
          ['e', '2', RELAY_3],
          ['p', '1', RELAY_2],
          ['p', '2', RELAY_3],
        ],
      }),
      createNote({
        tags: [
          ['e', '3', RELAY_3],
          ['e', '4', RELAY_2],
          ['p', '3', RELAY_3],
          ['p', '4', RELAY_2],
        ],
      }),
    ]
    expect(Note.mergeRelayHints(notes)).toStrictEqual({
      ids: {
        '1': [RELAY_2],
        '2': [RELAY_3],
        '3': [RELAY_3],
        '4': [RELAY_2],
      },
      authors: {
        '1': [RELAY_2],
        '2': [RELAY_3],
        '3': [RELAY_3],
        '4': [RELAY_2],
      },
    })
  })

  test('Should expect seendAt relay', async ({ root, createNote }) => {
    const note = createNote({})
    await root.nostr.addEvent(note.id, [RELAY_2])
    expect(note.seenOn).toStrictEqual([RELAY_2])
  })

  test('Should expect total replies', async ({ root }) => {
    const rootNote = await root.notes.load(fakeNote({ id: '1' }))
    await root.notes.load(fakeNote({ id: '2', tags: [['e', '1']] }))
    await root.notes.load(fakeNote({ id: '3', tags: [['e', '1']] }))
    await root.notes.load(fakeNote({ id: '4', tags: [['e', '2']] }))
    await root.notes.load(fakeNote({ id: '5', tags: [['e', '3']] }))
    await root.notes.load(fakeNote({ id: '6', tags: [['e', '4']] }))
    await root.notes.load(fakeNote({ id: '7', tags: [['e', '5']] }))
    await root.notes.load(fakeNote({ id: '8', tags: [['e', '7']] }))
    expect(rootNote.totalReplies).toBe(7)
  })

  test('Should expect the replies based on the following list', async ({ root }) => {
    root.auth.pubkey = '1'
    await root.contacts.add(
      fakeNote({
        pubkey: '1',
        created_at: 1,
        tags: [
          ['p', '2'],
          ['p', '3'],
          ['p', '4'],
        ],
      }),
    )
    const notes = await root.notes.loadNotes([
      fakeNote({ id: '1', pubkey: '5' }),
      fakeNote({ id: '2', pubkey: '2', tags: [['e', '1']] }),
      fakeNote({ id: '7', pubkey: '7', tags: [['e', '1']] }),
      fakeNote({ id: '8', pubkey: '8', tags: [['e', '1']] }),
      fakeNote({ id: '5', pubkey: '5', tags: [['e', '1']] }),
      fakeNote({ id: '4', pubkey: '4', tags: [['e', '5']] }),
    ])
    const rootNote = notes[0]
    rootNote.relevantAuthors = ['2', '3', '4']
    expect(rootNote?.repliesPreview.map((x) => x.id)).toStrictEqual(['2'])
    expect(rootNote?.repliesSorted.map((x) => x.id)).toStrictEqual(['2', '5', '7', '8'])
  })

  test('Should not expect any replies since no following list was found', async ({ root }) => {
    root.auth.pubkey = '1'
    const notes = await root.notes.loadNotes([
      fakeNote({ id: '1', pubkey: '5' }),
      fakeNote({ id: '2', pubkey: '2', tags: [['e', '1']] }),
      fakeNote({ id: '7', pubkey: '7', tags: [['e', '1']] }),
    ])
    const rootNote = notes[0]
    expect(rootNote?.repliesPreview.map((x) => x.id)).toStrictEqual([])
  })
})
