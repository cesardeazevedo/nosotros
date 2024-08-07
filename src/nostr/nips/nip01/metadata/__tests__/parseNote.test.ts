import type { NostrEvent, RelayHints } from 'core/types'
import { nip19 } from 'nostr-tools'
import { fakeNote, fakeSignature } from 'utils/faker'
import { RELAY_2, RELAY_3, test } from 'utils/fixtures'
import { parseNote } from '../parseNote'

const parse = (partial: Partial<NostrEvent>) => parseNote(fakeNote(partial)).metadata

describe('Test noteStore', () => {
  test('Should expect isRoot true', () => {
    const note = parse({ id: '1', tags: [] })
    expect(note.isRoot).toBe(true)
    expect(note.rootNoteId).toBe(undefined)
  })

  test('Should assert rootNoteId', () => {
    const note = parse({
      id: '1',
      tags: [['e', '2']],
    })
    expect(note.isRoot).toBe(false)
    expect(note.isRootReply).toBe(true)
    expect(note.isReplyOfAReply).toBe(false)
    expect(note.rootNoteId).toBe('2')
  })

  test('Should expect isRoot with mention', () => {
    const note = parse({ id: '1', tags: [['e', '2', '', 'mention']] })
    expect(note.isRoot).toBe(true)
    expect(note.isRootReply).toBe(false)
    expect(note.isReplyOfAReply).toBe(false)
  })

  test('Should expect isRoot false and isRootReply true', () => {
    const note = parse({
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

  test('Should expect isRootReply true and isReplyOfAReply false', () => {
    const note = parse({
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

  test('Should expect isRootReply false', () => {
    const note = parse({
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

  test('Should expect multiple replies and match isReplyOfAReply true', () => {
    const note = parse({
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

  test('Should expect mentionedNotes match with `e` mention tags', () => {
    const note = parse({
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

  test('Should expect mentionedNotes match with nevent', () => {
    const event = fakeSignature(fakeNote({ content: 'related' }))
    const encoded = nip19.neventEncode({
      id: event.id,
      author: event.pubkey,
      relays: [],
    })
    const note = parse({
      id: '1',
      content: `hello nostr:${encoded}`,
      tags: [
        ['e', '1', '', 'mention'],
        ['q', '2'],
      ],
    })
    expect(note.mentionedNotes).toStrictEqual(['1', '2', event.id])
    expect(note.rootNoteId).toBe(undefined)
    expect(note.parentNoteId).toBeUndefined()
  })

  test('Should expect mentionedAuthors from a nevent encoded author', () => {
    const encoded = nip19.neventEncode({
      id: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
      author: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
    })
    const note = parse({
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

  test('Should expect mentionedAuthors match with nprofileEncode and `p` tags', () => {
    const encoded = nip19.nprofileEncode({
      pubkey: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
      relays: [RELAY_2, RELAY_3],
    })
    const note = parse({
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

  test('Should expect relayHints from both tags and references', () => {
    const event1 = fakeSignature(fakeNote())
    const event2 = fakeSignature(fakeNote({ pubkey: '2' }))
    const nevent1 = nip19.neventEncode({ id: event1.id, relays: [RELAY_2, RELAY_3] })
    const nevent2 = nip19.neventEncode({ id: event2.id, relays: [] })
    const profile1 = nip19.nprofileEncode({ pubkey: event1.pubkey, relays: [RELAY_2] })
    const profile2 = nip19.nprofileEncode({ pubkey: event2.pubkey, relays: [] })
    const note = parseNote(
      fakeNote({
        id: '1',
        content: `hello nostr:${nevent1} nostr:${nevent2} nostr:${profile1} nostr:${profile2}`,
        tags: [
          ['p', '1', RELAY_2],
          ['p', '2'],
          ['e', '1', RELAY_2],
          ['e', '1', RELAY_2],
          ['e', '2'],
        ],
      }),
    )
    expect(note.metadata.relayHints).toStrictEqual({
      authors: { '1': [RELAY_2], [event1.pubkey]: [RELAY_2] },
      ids: { '1': [RELAY_2], [event1.id]: [RELAY_2, RELAY_3] },
      fallback: {
        [event2.id]: note.metadata.mentionedAuthors,
      },
    } as RelayHints)
  })
})
