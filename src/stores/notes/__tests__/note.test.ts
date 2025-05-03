import { Kind } from '@/constants/kinds'
import { eventStore } from '@/stores/events/event.store'
import { seenStore } from '@/stores/seen/seen.store'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { Mutelist } from 'nostr-tools/kinds'

describe('Note', () => {
  test('assert isFollowing', ({ login, createNote, createFollows }) => {
    const note = createNote({ id: '1', pubkey: '2' })
    const user = login(note.event.pubkey)
    expect(note.event.isFollowing(user)).toBe(false)
    createFollows(user.pubkey, [note.event.pubkey])
    expect(note.event.isFollowing(user)).toBe(true)
  })

  test('assert reactions', ({ createNote }) => {
    const note = createNote({ id: '1', kind: Kind.Article, pubkey: '1', tags: [] })
    const reaction = fakeEvent({ id: '10', kind: Kind.Reaction, pubkey: '2', tags: [['e', '1']] })
    const reaction2 = fakeEvent({ id: '11', kind: Kind.Reaction, pubkey: '3', tags: [['e', '1']] })
    // assert a note with both e and a so we can assert they won't duplicate
    const reaction3 = fakeEvent({
      id: '12',
      kind: Kind.Reaction,
      pubkey: '4',
      tags: [
        ['e', '1'],
        ['a', note.event.address],
      ],
    })
    eventStore.add(reaction)
    eventStore.add(reaction2)
    eventStore.add(reaction3)
    expect(note.reactions).toHaveLength(3)
  })

  test('assert reposts', ({ createNote }) => {
    const note = createNote({ id: '1', kind: Kind.Article, pubkey: '1', tags: [] })
    const repost = fakeEvent({ id: '10', kind: Kind.Repost, pubkey: '2', tags: [['e', '1']] })
    const repost2 = fakeEvent({ id: '11', kind: Kind.Repost, pubkey: '3', tags: [['e', '1']] })
    // assert a note with both e and a so we can assert they won't duplicate
    const repost3 = fakeEvent({
      id: '12',
      kind: Kind.Repost,
      pubkey: '4',
      tags: [
        ['e', '1'],
        ['a', note.event.address],
      ],
    })
    const quote1 = fakeEvent({
      id: '13',
      kind: Kind.Text,
      pubkey: '5',
      tags: [['q', '1']],
    })
    const quote2 = fakeEvent({
      id: '14',
      kind: Kind.Text,
      pubkey: '5',
      tags: [['q', note.event.address]],
    })
    const quote3 = fakeEvent({
      id: '15',
      kind: Kind.Text,
      pubkey: '5',
      // This shouldn't really happen
      tags: [
        ['q', '1'],
        ['q', note.event.address],
      ],
    })
    eventStore.add(repost)
    eventStore.add(repost2)
    eventStore.add(repost3)
    eventStore.add(quote1)
    eventStore.add(quote2)
    eventStore.add(quote3)
    expect(note.reposts).toHaveLength(6)
  })

  test('assert zaps', ({ createNote }) => {
    const note = createNote({ id: '1', kind: Kind.Article, pubkey: '1', tags: [] })
    const zap = fakeEvent({ id: '10', kind: Kind.ZapReceipt, pubkey: '2', tags: [['e', '1']] })
    const zap2 = fakeEvent({ id: '11', kind: Kind.ZapReceipt, pubkey: '3', tags: [['e', '1']] })
    // assert a note with both e and a so we can assert they won't duplicate
    const zap3 = fakeEvent({
      id: '12',
      kind: Kind.ZapReceipt,
      pubkey: '4',
      tags: [
        ['e', '1'],
        ['a', note.event.address],
      ],
    })
    eventStore.add(zap)
    eventStore.add(zap2)
    eventStore.add(zap3)
    expect(note.zaps).toHaveLength(3)
  })

  test('assert replies', ({ login, createNote }) => {
    const user = login('1')
    const note1 = createNote({ id: '1', pubkey: user?.pubkey, tags: [] })
    const note2 = createNote({ id: '2', pubkey: '2', tags: [['e', '1', '', 'root']] })
    const note3 = createNote({ id: '3', pubkey: '3', tags: [['e', '1', '', 'root']] })
    const note4 = createNote({ id: '4', pubkey: '4', tags: [['e', '1', '', 'root']] })
    // Note 2 is out of repliesPreview
    expect(note1.replies).toStrictEqual([note2.event, note3.event, note4.event])
  })

  test('assert repliesPreview', ({ login, createNote, createFollows }) => {
    const user = login('1')
    const rootNote = createNote({ id: '0', pubkey: user?.pubkey, tags: [] })

    createNote({ id: '1', pubkey: '2', tags: [['e', '0', '', 'root']] })
    createNote({ id: '2', pubkey: user.pubkey, tags: [['e', '0', '', 'root']] })
    const reply3 = createNote({ id: '3', pubkey: '3', tags: [['e', '0', '', 'root']] })

    createFollows(user.pubkey, ['3'])

    const preview = rootNote.repliesPreview(user)
    expect(preview).toStrictEqual([reply3.event])
  })

  test('assert repliesSorted', ({ login, createNote, createFollows }) => {
    const user = login('1')
    const rootNote = createNote({ id: '0', pubkey: user?.pubkey, tags: [] })

    const reply1 = createNote({ id: '1', pubkey: '2', tags: [['e', '0', '', 'root']] })
    const reply2 = createNote({ id: '2', pubkey: user.pubkey, tags: [['e', '0', '', 'root']] })
    const reply3 = createNote({ id: '3', pubkey: '3', tags: [['e', '0', '', 'root']] })

    createFollows(user.pubkey, ['3'])

    const sortedReplies = rootNote.repliesSorted(user)
    expect(sortedReplies).toStrictEqual([reply2.event, reply3.event, reply1.event])
  })

  test('assert repleisSorted with muted events and author', ({ login, createNote, createFollows }) => {
    const user = login('1')
    const rootNote = createNote({ id: '0', pubkey: user?.pubkey, tags: [] })

    const reply1 = createNote({ id: '1', pubkey: '2', tags: [['e', '0', '', 'root']] })
    const reply2 = createNote({ id: '2', pubkey: user.pubkey, tags: [['e', '0', '', 'root']] })
    const reply3 = createNote({ id: '3', pubkey: '3', tags: [['e', '0', '', 'root']] })
    const reply4 = createNote({ id: '4', pubkey: '4', tags: [['e', '0', '', 'root']] })

    createFollows(user.pubkey, ['2'])

    eventStore.add(
      fakeEvent({
        kind: Mutelist,
        pubkey: '1',
        tags: [
          ['e', '4'],
          ['p', '3'],
        ],
      }),
    )

    expect(rootNote.repliesSorted(user)).toEqual([reply2.event, reply1.event])
    expect(rootNote.repliesMuted(user)).toStrictEqual([reply3.event, reply4.event])
  })

  test('assert replyTags', ({ createNote }) => {
    const note1 = createNote({ id: '1', pubkey: '1', tags: [] })
    expect(note1.replyTags).toStrictEqual([
      ['e', '1', '', 'root', '1'],
      ['p', '1'],
    ])

    const note2 = createNote({ id: '2', pubkey: '2', tags: [['e', '1', '', 'root']] })
    expect(note2.replyTags).toStrictEqual([
      ['e', '1', '', 'root', '1'],
      ['e', '2', '', 'reply', '2'],
      ['p', '2'],
    ])

    const note3 = createNote({
      id: '3',
      pubkey: '3',
      tags: [
        ['e', '1', '', 'root'],
        ['e', '2', '', 'reply'],
      ],
    })
    expect(note3.replyTags).toStrictEqual([
      ['e', '1', '', 'root', '1'],
      ['e', '3', '', 'reply', '3'],
      ['p', '3'],
    ])

    const note4 = createNote({
      id: '4',
      pubkey: '4',
      tags: [
        ['e', '1', '', 'root'],
        ['e', '3', '', 'reply'],
      ],
    })
    expect(note4.replyTags).toStrictEqual([
      ['e', '1', '', 'root', '1'],
      ['e', '4', '', 'reply', '4'],
      ['p', '4'],
    ])
  })

  test('assert replyTags with missing root', ({ createNote }) => {
    const note = createNote({
      id: '2',
      pubkey: '2',
      tags: [['e', '1', '', 'reply']],
    })
    expect(note.replyTags).toStrictEqual([
      ['e', '2', '', 'reply', '2'],
      ['p', '2'],
    ])
  })

  test('assert replyTags for a media note', ({ createNote }) => {
    const root = createNote({
      id: 'root_1',
      pubkey: 'pubkey_1',
      kind: Kind.Media,
      tags: [['d', '123']],
    })
    seenStore.add({ kind: Kind.Media, eventId: 'root_1', relay: 'wss://relay1.com' })
    expect(root.replyTags).toStrictEqual([
      ['E', 'root_1', 'wss://relay1.com', 'pubkey_1'],
      ['K', '20'],
      ['P', 'pubkey_1'],
      ['e', 'root_1', 'wss://relay1.com', 'pubkey_1'],
      ['k', '20'],
      ['p', 'pubkey_1'],
    ])
  })

  test('assert reply to article', ({ createNote }) => {
    const article = createNote({
      id: 'id_1_root',
      pubkey: 'pubkey_1',
      kind: Kind.Article,
      tags: [['d', '123']],
    })
    expect(article.replyTags).toStrictEqual([
      ['A', '30023:pubkey_1:123', '', 'pubkey_1'],
      ['E', 'id_1_root', '', 'pubkey_1'],
      ['K', '30023'],
      ['P', 'pubkey_1'],
      ['e', 'id_1_root', '', 'pubkey_1'],
      ['k', '30023'],
      ['p', 'pubkey_1'],
    ])
  })

  test('assert replyTags for comments', ({ createNote, createComment }) => {
    createNote({
      id: 'id_1_root',
      pubkey: 'pubkey_1',
      kind: Kind.Article,
      tags: [['d', '123']],
    })
    const note1 = createComment({
      id: '1',
      pubkey: 'pubkey_2',
      tags: [
        ['E', 'id_1_root'],
        ['K', '30023'],
        ['P', 'pubkey_1'],
        // The parent event address (same as root for top-level comments)
        ['e', 'id_1_root'],
        ['k', '1'],
      ],
    })
    expect(note1.replyTags).toStrictEqual([
      ['A', '30023:pubkey_1:123', '', 'pubkey_1'],
      ['E', 'id_1_root', '', 'pubkey_1'],
      ['K', '30023'],
      ['P', 'pubkey_1'],
      ['e', '1', '', 'pubkey_2'],
      ['k', '1111'],
      ['p', 'pubkey_2'],
    ])
  })

  test('assert comments with nip10 replies', ({ createNote, createComment }) => {
    const note1 = createNote({ kind: Kind.Article, id: '1', pubkey: '1', tags: [] })
    const note2 = createNote({ id: '2', pubkey: '2', tags: [['e', '1', '', 'root']] })
    const comment1 = createComment({
      id: '3',
      pubkey: '2',
      tags: [
        ['E', '1'],
        ['K', '30023'],
        ['e', '1'],
      ],
    })
    const comment2 = createComment({
      id: '4',
      pubkey: '2',
      tags: [
        ['E', '1'],
        ['e', '3'],
      ],
    })
    expect(note1.replies).toStrictEqual([note2.event, comment1.event])
    expect(comment1.replies).toStrictEqual([comment2.event])
  })
})
