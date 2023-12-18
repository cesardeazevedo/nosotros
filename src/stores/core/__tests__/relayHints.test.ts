import { nip19 } from 'nostr-tools'
import { Note } from 'stores/modules/note.store'
import { RELAY_1, RELAY_2, RELAY_3, test } from 'utils/fixtures'

const id = 'd6c3fcef47d0707979af9b25730b702a92cd0fda10b860d027948e863f19d81e'
const id2 = 'f5ca802cfafdf804b1fe47ba3686e90b101610ada8d72a4968448fd76e202473'

describe('relayHints', () => {
  test('Should expect authors relay from the note it was seen at', async ({ root, createNote }) => {
    await root.nostr.addEvent('1', [RELAY_2])
    const note = createNote({
      id: '1',
      pubkey: '2',
    })
    expect(note.relayHints).toStrictEqual({
      authors: {
        '2': [RELAY_2],
      },
    })
  })

  test('Test relay hints and merge', ({ createNote }) => {
    const note = createNote({
      id: '1',
      tags: [
        ['e', '0'],
        ['e', '1', 'wss://relay1.com'],
        ['e', '2', 'wss://relay2.com'],
        ['e', '3', 'wss://relay3.com'],
        ['e', '3', 'wss://relay3_2.com'], // duplicated
        ['p', '4', 'wss://relay4.com'],
        ['p', '5', 'wss://relay5.com'],
        ['p', '5', 'wss://relay5_2.com'], // duplicated
        ['p', '6'],
      ],
    })
    expect(note.relayHints).toStrictEqual({
      authors: {
        '4': ['wss://relay4.com'],
        '5': ['wss://relay5.com', 'wss://relay5_2.com'],
      },
      ids: {
        '1': ['wss://relay1.com'],
        '2': ['wss://relay2.com'],
        '3': ['wss://relay3.com', 'wss://relay3_2.com'],
      },
    })
    const post2 = createNote({
      id: '2',
      tags: [
        ['e', '1', 'wss://relay10.com'],
        ['e', '7', 'wss://relay3.com'],
        ['p', '4', 'wss://relay4.com'],
        ['p', '5', 'wss://relay6.com'],
        ['p', '6', 'wss://relay7.com'],
      ],
    })
    expect(post2.relayHints).toStrictEqual({
      authors: {
        '4': ['wss://relay4.com'],
        '5': ['wss://relay6.com'],
        '6': ['wss://relay7.com'],
      },
      ids: {
        '1': ['wss://relay10.com'],
        '7': ['wss://relay3.com'],
      },
    })
    expect(Note.mergeRelayHints([note, post2])).toStrictEqual({
      authors: {
        '4': ['wss://relay4.com'],
        '5': ['wss://relay5.com', 'wss://relay5_2.com', 'wss://relay6.com'],
        '6': ['wss://relay7.com'],
      },
      ids: {
        '1': ['wss://relay1.com', 'wss://relay10.com'],
        '2': ['wss://relay2.com'],
        '3': ['wss://relay3.com', 'wss://relay3_2.com'],
        '7': ['wss://relay3.com'],
      },
    })
  })

  test('should match a `q` tag', ({ createNote }) => {
    const note = createNote({
      id: '1',
      pubkey: '1',
      content: '',
      tags: [['q', '2', RELAY_2]],
    })
    expect(note.relayHints).toStrictEqual({
      ids: {
        '2': [RELAY_2],
      },
    })
  })

  test('should match a encoded note as a fallback to the event.pubkey', ({ createNote }) => {
    const id = '95b6123fff6c34f9aef702bac27b6e7918e0c742b1ab4061a1bc68d70db858bf'
    const encoded = nip19.noteEncode(id)
    const note = createNote({
      id: '1',
      pubkey: '1',
      content: `nostr:${encoded}`,
      tags: [['e', '10', RELAY_2]],
    })
    expect(note.relayHints).toStrictEqual({
      ids: {
        '10': [RELAY_2],
      },
      fallback: {
        [id]: ['1'],
      },
    })
  })

  test('assert nevent with multiple encoded relays', ({ createNote }) => {
    const nevent1 = nip19.neventEncode({ id, relays: [RELAY_2, RELAY_3] })
    const nevent2 = nip19.neventEncode({ id: id2, relays: [RELAY_1, RELAY_2] })
    const note = createNote({
      content: `nostr:${nevent1} nostr:${nevent2}`,
      tags: [
        ['p', '1', RELAY_1],
        ['p', '2', RELAY_2],
        ['e', '1', RELAY_2],
        ['e', '2', RELAY_3],
      ],
    })
    // Manually set some initial relay hint for testing
    note.hints.hints = { authors: { '3': [RELAY_3] } }

    expect(note.relayHints).toStrictEqual({
      authors: { '1': [RELAY_1], '2': [RELAY_2], '3': [RELAY_3] },
      ids: {
        '1': [RELAY_2],
        '2': [RELAY_3],
        [id]: [RELAY_2, RELAY_3],
        [id2]: [RELAY_1, RELAY_2],
      },
    })
  })

  test('assert multiple nevent and encoded author', ({ createNote }) => {
    const nevent = nip19.neventEncode({
      id,
      relays: [RELAY_2, RELAY_3],
      author: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
    })
    const note = createNote({
      pubkey: '1',
      content: `nostr:${nevent}`,
      tags: [
        ['p', '1', RELAY_1],
        ['e', '5', RELAY_2],
      ],
    })
    expect(note.relayHints).toStrictEqual({
      authors: {
        '1': [RELAY_1],
      },
      ids: {
        '5': [RELAY_2],
        [id]: [RELAY_2, RELAY_3],
      },
    })
  })

  test('assert multiple nevent without relays and author', ({ createNote }) => {
    const nevent = nip19.neventEncode({ id })
    const note = createNote({
      pubkey: '1',
      content: `nostr:${nevent}`,
      tags: [['e', '5', RELAY_2]],
    })
    expect(note.relayHints).toStrictEqual({
      ids: { '5': [RELAY_2] },
      fallback: {
        [id]: ['1'],
      },
    })
  })

  test('test a note1 and assert relay from author', ({ createNote }) => {
    const note1 = nip19.noteEncode(id)
    const note = createNote({
      content: `nostr:${note1}`,
      pubkey: '1',
      tags: [['e', '1', RELAY_1]],
    })
    expect(note.relayHints).toStrictEqual({
      ids: {
        '1': [RELAY_1],
      },
      fallback: {
        [id]: ['1'],
      },
    })
  })

  test('should expect the mentioned authors as fallback for the encoded note', ({ createNote }) => {
    const note1 = nip19.noteEncode(id)
    const note = createNote({
      content: `nostr:${note1}`,
      pubkey: '1',
      tags: [
        ['e', '1', RELAY_2],
        ['p', '2'],
        ['p', '3'],
        ['p', '4'],
      ],
    })
    expect(note.relayHints).toStrictEqual({
      ids: {
        '1': [RELAY_2],
      },
      fallback: {
        [id]: ['1', '2', '3', '4'],
      },
    })
  })

  test('should match a encoded nprofile relays', ({ createNote }) => {
    const nprofile = nip19.nprofileEncode({ pubkey: id, relays: [RELAY_2] })
    const note = createNote({
      content: `nostr:${nprofile}`,
      pubkey: '1',
      tags: [['p', id, RELAY_3]],
    })
    expect(note.relayHints).toStrictEqual({
      authors: {
        [id]: [RELAY_3, RELAY_2],
      },
    })
  })
})
