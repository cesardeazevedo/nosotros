import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { parseComment } from '../parseComment'

describe('parseComment', () => {
  test('assert tags', () => {
    const event = fakeEvent({
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
      mentionedAuthors: ['pubkey1'],
      relayHints: {
        authors: { pubkey1: [RELAY_1] },
        ids: { id_1_root: [RELAY_1], id_1_reply_1: [RELAY_2] },
        idHints: { id_1_reply_1: ['pubkey2'] },
      },
      isRoot: false,
      rootId: 'id_1_root',
      parentId: 'id_1_reply_1',
    })
  })

  test('assert isReplyOfReply', () => {
    const event = fakeEvent({
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
      mentionedAuthors: ['pubkey1'],
      relayHints: {
        authors: { pubkey1: [RELAY_1] },
        ids: { id_1_root: [RELAY_1, RELAY_2] },
        idHints: { id_1_root: ['pubkey2'] },
      },
      isRoot: false,
      // isReplyOfAReply: false,
      rootId: 'id_1_root',
      parentId: 'id_1_root',
    })
  })
})
