import { Kind } from '@/constants/kinds'
import { listStore } from '@/stores/lists/lists.store'
import { test } from '@/utils/fixtures'

describe('Note', () => {
  test('assert isFollowing', ({ login, createNote, createFollows }) => {
    const note = createNote({ pubkey: '2' })
    const user = login(note.event.pubkey)
    expect(note.event.isFollowing(user)).toBe(false)
    createFollows(user.pubkey, [note.event.pubkey])
    expect(note.event.isFollowing(user)).toBe(true)
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

    listStore.muteE.set('1', new Set(['4']))
    listStore.muteP.set('1', new Set(['3']))

    expect(rootNote.repliesSorted(user)).toStrictEqual([reply2.event, reply1.event])
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

  test('assert replyTags for comments', ({ createNote, createComment }) => {
    createNote({
      id: 'id_1_root',
      pubkey: 'pubkey_1',
      kind: Kind.Article,
      tags: [['d', '123']],
    })
    const note3 = createComment({
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
    expect(note3.replyTags).toStrictEqual([
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
