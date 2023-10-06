import { RELAY_2, test } from 'utils/fixtures'
import { PostStore } from '../post.store'

describe('Test PostStore', () => {
  describe('Add and replies', () => {
    test('addReply()', ({ createPost }) => {
      const post = createPost({ id: '1', tags: [] })
      const reply = createPost({ id: '2' })
      post.addReply(reply)
      expect(Object.fromEntries(post.replies)).toStrictEqual({ 2: reply })
    })

    test('repliesTree', ({ createPost }) => {
      const post = createPost({ id: '1', tags: [] })
      const post2 = createPost({ id: '2', tags: [['e', '1']] })
      const post3 = createPost({ id: '3', tags: [['e', '1']] })
      const post4 = createPost({
        id: '4',
        tags: [
          ['e', '1'],
          ['e', '3'],
        ],
      })
      const post5 = createPost({
        id: '5',
        tags: [
          ['e', '1'],
          ['e', '3'],
          ['e', '4'],
        ],
      })
      post.addReply(post2)
      post.addReply(post3)
      post.addReply(post4)
      post.addReply(post5)

      const tree = Object.assign({}, Object.fromEntries(post.repliesTree))
      expect(tree).toStrictEqual({ 2: post2, 3: post3 })
      expect(Object.fromEntries(tree[3].replies)).toStrictEqual({ 4: post4 })
      expect(Object.fromEntries(tree[3].replies.get('4')?.replies || [])).toStrictEqual({ 5: post5 })
    })
  })

  test('mergeTags()', ({ createPost }) => {
    const posts = [
      createPost({
        tags: [
          ['e', '1'],
          ['e', '2'],
          ['e', '3'],
        ],
      }),
      createPost({
        tags: [
          ['e', '4'],
          ['e', '5'],
          ['e', '6'],
        ],
      }),
      createPost({ tags: [] }),
    ]
    expect(PostStore.mergeTags(posts.map((post) => post.event.tags))).toStrictEqual(['1', '2', '3', '4', '5', '6'])
  })

  describe('isRoot, isRootReply(), isReplyOfAReply()', () => {
    test('Test isRoot true', ({ createPost }) => {
      const post = createPost({ id: '1', tags: [] })
      expect(post.isRoot).toBe(true)
      expect(post.rootNoteId).toBe('1')
    })

    test('Test isRoot with mention', ({ createPost }) => {
      const post = createPost({ id: '1', tags: [['e', '2', '', 'mention']] })
      expect(post.isRoot).toBe(true)
      expect(post.isRootReply).toBe(false)
      expect(post.isReplyOfAReply).toBe(false)
    })

    test('Test isRoot false', ({ createPost }) => {
      const post = createPost({
        id: '1',
        tags: [
          ['e', '2'],
          ['e', '3', '', 'mention'],
        ],
      })
      expect(post.isRoot).toBe(false)
      expect(post.isRootReply).toBe(true)
      expect(post.rootNoteId).toBe('2')
    })

    test('Test isRootReply true', ({ createPost }) => {
      const post = createPost({
        id: '1',
        tags: [
          ['e', '2'],
          ['e', '3', '', 'mention'],
        ],
      })
      expect(post.isRootReply).toBe(true)
      expect(post.isReplyOfAReply).toBe(false)
      expect(post.rootNoteId).toBe('2')
    })

    test('Test isRootReply false', ({ createPost }) => {
      const post = createPost({
        id: '1',
        tags: [
          ['e', '2'],
          ['e', '3'],
          ['e', '4', '', 'mention'],
        ],
      })
      expect(post.isRoot).toBe(false)
      expect(post.isRootReply).toBe(false)
      expect(post.isReplyOfAReply).toBe(true)
    })

    test('Test multiple replies', ({ createPost }) => {
      const post = createPost({
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
      expect(post.isRoot).toBe(false)
      expect(post.isRootReply).toBe(false)
      expect(post.isReplyOfAReply).toBe(true)
      expect(post.rootNoteId).toBe('2')
    })
  })

  describe('mentionsTags', () => {
    test('Test mentionsTags', ({ createPost }) => {
      const post = createPost({
        id: '1',
        tags: [
          ['e', '0'],
          ['e', '2', '', 'mention'],
          ['e', '3', '', 'mention'],
          ['e', '4', '', 'mention'],
        ],
      })
      expect(post.mentionsTags).toStrictEqual([
        ['e', '2', '', 'mention'],
        ['e', '3', '', 'mention'],
        ['e', '4', '', 'mention'],
      ])
    })
  })

  describe('relayHints', () => {
    test('Test relay hints and merge', async ({ createPost }) => {
      const post = createPost({
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
      expect(await post.relayHints()).toStrictEqual({
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
      const post2 = createPost({
        id: '2',
        tags: [
          ['e', '1', 'wss://relay10.com'],
          ['e', '7', 'wss://relay3.com'],
          ['p', '4', 'wss://relay4.com'],
          ['p', '5', 'wss://relay6.com'],
          ['p', '6', 'wss://relay7.com'],
        ],
      })
      expect(await post2.relayHints()).toStrictEqual({
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
      expect(PostStore.mergeRelayHints(await Promise.all([post.relayHints(), post2.relayHints()]))).toStrictEqual({
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

    test('Test relay hints from a quote', async ({ createPost }) => {
      const post = createPost({
        id: '1',
        pubkey: '1',
        content: '',
        tags: [['q', '2', RELAY_2]],
      })
      expect(await post.relayHints()).toStrictEqual({
        authors: {},
        ids: {
          '2': [RELAY_2],
        },
      })
    })

    test('Test relay hints from content nostr:note', async ({ createPost, createRelayList }) => {
      await createRelayList({ pubkey: '1', tags: [['r', 'wss://relay1.com']] })
      const post = createPost({
        id: '1',
        pubkey: '1',
        content: 'nostr:note1jkmpy0llds60nthhq2avy7mw0yvwp36zkx45qcdph35dwrdctzlsdcncdp',
        tags: [['e', '10', 'wss://relay2.com']],
      })
      expect(await post.relayHints()).toStrictEqual({
        authors: {},
        ids: {
          '10': ['wss://relay2.com'],
          '95b6123fff6c34f9aef702bac27b6e7918e0c742b1ab4061a1bc68d70db858bf': ['wss://relay1.com'],
        },
      })
    })
  })
})
