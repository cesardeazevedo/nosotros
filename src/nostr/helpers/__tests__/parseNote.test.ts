import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import type { NostrEvent, RelayHints } from 'core/types'
import { nip19 } from 'nostr-tools'
import { fakeNote, fakeSignature } from 'utils/faker'
import { test } from 'utils/fixtures'
import { parseNote } from '../parseNote'

const parse = (partial: Partial<NostrEvent>) => parseNote(fakeNote(partial))

describe('parseNote', () => {
  test('Should expect isRoot true', () => {
    const note = parse({ id: '1', tags: [] })
    expect(note.isRoot).toBe(true)
    expect(note.parentId).toBe(undefined)
    expect(note.rootId).toBe(undefined)
  })

  test('Should assert rootNoteId', () => {
    const note = parse({
      id: '1',
      tags: [['e', '2', '', 'root']],
    })
    expect(note.isRoot).toBe(false)
    expect(note.rootId).toBe('2')
    expect(note.parentId).toBe('2')
  })

  test('Should expect isRoot with mention', () => {
    const note = parse({ id: '1', tags: [['e', '2', '', 'mention']] })
    expect(note.isRoot).toBe(true)
  })

  test('Should expect isRoot false and isRootReply true', () => {
    const note = parse({
      id: '1',
      tags: [
        ['e', '2', '', 'root'],
        ['e', '3', '', 'mention'],
      ],
    })
    expect(note.isRoot).toBe(false)
    expect(note.rootId).toBe('2')
    expect(note.parentId).toBe('2')
  })

  test('Should expect isRootReply true and isReplyOfAReply false', () => {
    const note = parse({
      id: '1',
      tags: [
        ['e', '2', '', 'root'],
        ['e', '3', '', 'mention'],
      ],
    })
    expect(note.rootId).toBe('2')
    expect(note.parentId).toBe('2')
  })

  test('Should expect isRootReply false', () => {
    const note = parse({
      id: '1',
      tags: [
        ['e', '2', '', 'root'],
        ['e', '3', '', 'reply'],
        ['e', '4', '', 'mention'],
      ],
    })
    expect(note.isRoot).toBe(false)
    expect(note.rootId).toBe('2')
    expect(note.parentId).toBe('3')
  })

  test('Should expect multiple replies', () => {
    const note = parse({
      id: '1',
      tags: [
        ['e', '2', '', 'root'],
        ['e', '3'],
        ['e', '4'],
        ['e', '5'],
        ['e', '6', '', 'reply'],
        ['e', '7', '', 'mention'],
      ],
    })
    expect(note.isRoot).toBe(false)
    expect(note.rootId).toBe('2')
    expect(note.parentId).toBe('6')
  })

  test('Should expect a reply without root', () => {
    const note = parse({
      id: '1',
      tags: [
        ['p', '1'],
        ['e', '2'],
        ['e', '3', '', 'reply'],
      ],
    })
    expect(note.isRoot).toBe(false)
    expect(note.parentId).toBe('3')
  })

  test('Should expect mentionedNotes match with `e` mention tags', () => {
    const note = parse({
      id: '1',
      tags: [
        ['e', '0', '', 'root'],
        ['e', '2', '', 'mention'],
        ['e', '3', '', 'mention'],
        ['e', '4', '', 'mention'],
      ],
    })
    expect(note.mentionedNotes).toStrictEqual(['2', '3', '4'])
    expect(note.rootId).toBe('0')
    expect(note.parentId).toBe('0')
  })

  test('Should expect `a` tag root false', () => {
    const note = parse({
      id: '1',
      tags: [['a', '30023:1:key', '', 'root']],
    })
    expect(note.isRoot).toBe(false)
    expect(note.rootId).toBe('30023:1:key')
    expect(note.parentId).toBe('30023:1:key')

    const note2 = parse({
      id: '2',
      tags: [
        ['e', '1', '', 'reply'],
        ['a', '30023:1:key', '', 'root'],
      ],
    })
    expect(note2.isRoot).toBe(false)
    expect(note2.rootId).toBe('30023:1:key')
    expect(note2.parentId).toBe('1')
  })

  test('Should expect mentionedNotes match with nevent', () => {
    const event = fakeSignature(fakeNote({ content: 'related' }))
    const encoded = nip19.neventEncode({
      id: event.id,
      kind: 7,
      author: event.pubkey,
      relays: [RELAY_1],
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
    expect(note.relayHints).toStrictEqual({ ids: { [event.id]: [RELAY_1] } })
    expect(note.rootId).toBe(undefined)
    expect(note.parentId).toBeUndefined()
  })

  test('Should expect mentionedNotes and mentionedAuthors from naddress', () => {
    const event = fakeSignature(fakeNote({ kind: 30023, content: 'related' }))
    const encoded = nip19.naddrEncode({
      kind: event.kind,
      pubkey: event.pubkey,
      identifier: 'myarticle',
      relays: [RELAY_1],
    })
    const note = parse({
      id: '1',
      content: `nostr:${encoded}`,
      tags: [
        ['e', '1', '', 'mention'],
        ['p', '1'],
      ],
    })
    const id = `${event.kind}:${event.pubkey}:myarticle`
    expect(note.relayHints).toStrictEqual({ ids: { [id]: [RELAY_1] } })
    expect(note.mentionedNotes).toStrictEqual(['1', id])
    expect(note.mentionedAuthors).toStrictEqual(['1', event.pubkey])
  })

  test('Should expect mentionedAuthors from a nevent encoded author', () => {
    const encoded = nip19.neventEncode({
      id: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
      author: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
    })
    const note = parse({
      id: '1',
      content: `hello nostr:${encoded}`,
      pubkey: '1',
      tags: [['p', '10']],
    })
    expect(note.mentionedAuthors).toStrictEqual([
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
          ['e', '1', RELAY_2, '', 'p1'],
          ['e', '1', RELAY_2, '', 'p2'],
          ['e', '2', '', '', 'p3'],
        ],
      }),
    )
    expect(note.relayHints).toStrictEqual({
      authors: { '1': [RELAY_2], [event1.pubkey]: [RELAY_2] },
      ids: { '1': [RELAY_2], [event1.id]: [RELAY_2, RELAY_3] },
      fallback: {
        '1': ['p1', 'p2'],
        '2': ['p3'],
      },
    } as RelayHints)
  })
})
