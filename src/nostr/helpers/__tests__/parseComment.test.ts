import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2 } from '@/constants/testRelays'
import { fakeNote } from '@/utils/faker'
import { parseComment } from '../parseComment'

describe('parseComment', () => {
  test('assert tags', () => {
    const event = fakeNote({
      id: 'id_1_reply_2',
      kind: Kind.Comment,
      pubkey: 'pubkey3',
      tags: [
        ['E', 'id_1_root', RELAY_1],
        ['K', '1'],
        ['P', 'pubkey1', RELAY_1],
        // The parent event address (same as root for top-level comments)
        ['e', 'id_1_reply_1', RELAY_2, 'pubkey2'],
        ['k', '1'],
      ],
    })

    const { contentSchema, ...rest } = parseComment(event)
    expect(rest).toStrictEqual({
      imeta: {},
      mentionedNotes: [],
      mentionedAuthors: [],
      relayHints: {
        authors: { pubkey1: [RELAY_1] },
        ids: { id_1_root: [RELAY_1], id_1_reply_1: [RELAY_2] },
        fallback: { id_1_reply_1: ['pubkey2'] },
      },
      isRoot: false,
      id: 'id_1_reply_2',
      kind: 1111,
      rootKind: '1',
      rootId: 'id_1_root',
      parentId: 'id_1_reply_1',
      parentKind: '1',
    })
  })

  test('assert isReplyOfReply', () => {
    const event = fakeNote({
      id: 'id_1_reply_2',
      kind: Kind.Comment,
      pubkey: 'pubkey3',
      tags: [
        ['E', 'id_1_root', RELAY_1],
        ['K', '1'],
        ['P', 'pubkey1', RELAY_1],
        // The parent event address (same as root for top-level comments)
        ['e', 'id_1_root', RELAY_2, 'pubkey2'],
        ['k', '1'],
      ],
    })

    const { contentSchema, ...rest } = parseComment(event)
    expect(rest).toStrictEqual({
      imeta: {},
      mentionedNotes: [],
      mentionedAuthors: [],
      relayHints: {
        authors: { pubkey1: [RELAY_1] },
        ids: { id_1_root: [RELAY_1, RELAY_2] },
        fallback: { id_1_root: ['pubkey2'] },
      },
      isRoot: false,
      id: 'id_1_reply_2',
      kind: 1111,
      // isReplyOfAReply: false,
      rootKind: '1',
      rootId: 'id_1_root',
      parentId: 'id_1_root',
      parentKind: '1',
    })
  })
})
