import { test } from '@/utils/fixtures'

describe('Note', () => {
  test('assert isFollowing', ({ login, createNote, createFollows }) => {
    const note = createNote({ pubkey: '2' })
    const user = login(note.event.pubkey)
    expect(note.isFollowing(user)).toBe(false)
    createFollows(user.pubkey, [note.event.pubkey])
    expect(note.isFollowing(user)).toBe(true)
  })

  test('assert replies', ({ login, createNote, createFollows }) => {
    const user = login('1')
    const note1 = createNote({ id: '1', pubkey: user?.pubkey, tags: [] })
    createNote({ id: '2', pubkey: '2', tags: [['e', '1']] })
    const note3 = createNote({ id: '3', pubkey: '3', tags: [['e', '1']] })
    const note4 = createNote({ id: '4', pubkey: '4', tags: [['e', '1']] })
    // Note 2 is out of repliesPreview
    createFollows(user.pubkey, ['3', '4'])
    expect(note1.repliesPreview(user)).toStrictEqual([note3, note4])
  })

  test('assert replyTags', ({ createNote }) => {
    const note1 = createNote({ id: '1', pubkey: '1', tags: [] })
    const note2 = createNote({ id: '2', pubkey: '2', tags: [['e', '1']] })
    const note3 = createNote({
      id: '3',
      pubkey: '3',
      tags: [
        ['e', '1'],
        ['e', '2'],
      ],
    })
    const note4 = createNote({
      id: '4',
      pubkey: '4',
      tags: [
        ['e', '1'],
        ['e', '2'],
        ['e', '3'],
      ],
    })
    expect(note1.replyTags).toStrictEqual([
      ['e', '1', '', 'root', '1'],
      ['p', '1'],
    ])
    expect(note2.replyTags).toStrictEqual([
      ['e', '1', '', 'root', '1'],
      ['e', '2', '', 'reply', '2'],
      ['p', '2'],
    ])
    expect(note3.replyTags).toStrictEqual([
      ['e', '1', '', 'root', '1'],
      ['e', '3', '', 'reply', '3'],
      ['p', '3'],
    ])
    expect(note4.replyTags).toStrictEqual([
      ['e', '1', '', 'root', '1'],
      ['e', '4', '', 'reply', '4'],
      ['p', '4'],
    ])
  })
})
