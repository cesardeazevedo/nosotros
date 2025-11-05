import { Kind } from '@/constants/kinds'
import { fakeEventMeta } from '@/utils/faker'
import { queryKeys } from '../queryKeys'
import { buildRepliesQueryOptions } from '../useReplies'

describe('buildRepliesQueryOptions', () => {
  test('assert buildRepliesQueryOptions for a root note', () => {
    const event = fakeEventMeta({
      id: 'note1',
      pubkey: 'user1',
      kind: Kind.Text,
    })

    const result = buildRepliesQueryOptions(event)
    expect(result).toStrictEqual({
      queryKey: queryKeys.tag('e', ['note1'], Kind.Text),
      filter: {
        kinds: [Kind.Text, Kind.Comment],
        '#e': ['note1'],
      },
      relayHints: {
        idHints: {
          note1: ['user1'],
        },
      },
    })
  })

  test('assert buildRepliesQueryOptions for a reply note', () => {
    const event = fakeEventMeta({
      id: 'reply1',
      pubkey: 'user1',
      kind: Kind.Text,
      tags: [['e', 'root1', '', 'root', 'pubkey_root']],
    })
    const result = buildRepliesQueryOptions(event)
    expect(result).toStrictEqual({
      queryKey: queryKeys.tag('e', ['root1'], Kind.Text),
      filter: {
        kinds: [Kind.Text, Kind.Comment],
        '#e': ['root1', 'reply1'],
      },
      relayHints: {
        idHints: {
          root1: ['pubkey_root', 'user1'],
          reply1: ['user1'],
        },
      },
    })
  })

  test('assert buildRepliesQueryOptions for a comment note', () => {
    const event = fakeEventMeta({
      id: 'comment1',
      pubkey: 'user1',
      kind: Kind.Comment,
      tags: [['E', 'root1', '', 'pubkey_root']],
    })
    const result = buildRepliesQueryOptions(event)
    expect(result).toStrictEqual({
      queryKey: queryKeys.tag('e', ['root1'], Kind.Text),
      filter: {
        kinds: [Kind.Text, Kind.Comment],
        '#E': ['root1', 'comment1'],
      },
      relayHints: {
        idHints: {
          root1: ['pubkey_root', 'user1'],
          comment1: ['user1'],
        },
      },
    })
  })

  test('assert buildRepliesQueryOptions for a reply note of a article', () => {
    const event = fakeEventMeta({
      id: 'article1',
      pubkey: 'pubkey1',
      kind: Kind.Article,
      tags: [['d', '123']],
    })
    const result = buildRepliesQueryOptions(event)
    expect(result).toStrictEqual({
      queryKey: queryKeys.tag('a', ['30023:pubkey1:123'], Kind.Text),
      filter: {
        kinds: [Kind.Text, Kind.Comment],
        '#E': ['article1'],
        '#a': ['30023:pubkey1:123'],
      },
      relayHints: {
        idHints: {
          '30023:pubkey1:123': ['pubkey1'],
          article1: ['pubkey1'],
        },
      },
    })
  })
})
