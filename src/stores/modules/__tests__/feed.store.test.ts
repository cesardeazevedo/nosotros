import { Kind } from 'constants/kinds'
import { fakeNote } from 'utils/faker'
import { RELAY_2, RELAY_3, test } from 'utils/fixtures'
import { delay, expectMessage, getJSONFeed, sendMessages } from 'utils/testHelpers'

describe('FeedStore', () => {
  describe('add()', () => {
    test('simple add()', ({ createFeed, createPost }) => {
      const feed = createFeed()
      const post = createPost({ id: '1' })
      feed.add(post)
      expect(Object.fromEntries(feed.feed)).toEqual({
        '1': post,
      })
    })

    test('add() as a reply first, then parent', ({ createFeed, createPost }) => {
      const feed = createFeed()
      const replyPost = createPost({ id: '2', tags: [['e', '1']] })
      feed.add(replyPost)
      expect(Object.fromEntries(feed.tempReplies)).toEqual({
        '1': [replyPost],
      })
      expect(Object.fromEntries(feed.feed)).toEqual({})

      const parentPost = createPost({ id: '1' })
      feed.add(parentPost)
      parentPost.addReply(replyPost)
      expect(Object.fromEntries(feed.feed)).toEqual({
        '1': parentPost,
      })
    })

    test('add() parent post, then reply', ({ createFeed, createPost }) => {
      const feed = createFeed()
      const parentPost = createPost({ id: '1' })
      feed.add(parentPost)

      expect(Object.fromEntries(feed.feed)).toEqual({ '1': parentPost })

      const replyPost = createPost({ id: '2', tags: [['e', '1']] })
      feed.add(replyPost)
      parentPost.addReply(replyPost)
      expect(Object.fromEntries(feed.feed)).toEqual({ '1': parentPost })
    })
  })

  describe('Subscriptions', () => {
    test('Test subNotesByAuthor()', async ({ relays, createFeed }) => {
      const authors = ['1', '2', '3', '4']
      const [relay] = relays

      const feed = createFeed()
      feed.subNotesByAuthors(authors)

      const reqId = await expectMessage(relay, { kinds: [Kind.Text, Kind.Article], authors })

      await sendMessages(relay, reqId, [
        fakeNote({ id: '1', pubkey: '1' }),
        fakeNote({ id: '2', pubkey: '2', tags: [['e', '1']] }),
        fakeNote({ id: '3', pubkey: '3' }),
        fakeNote({ id: '4', pubkey: '4', tags: [['e', '3']] }),
      ])

      await expectMessage(relay, { kinds: [Kind.Metadata, Kind.RelayList], authors })
      await delay(1000)
      expect(relay.messages).toHaveLength(2)
      expect(getJSONFeed(feed.feed)).toStrictEqual({
        3: { replies: [{ 4: {} }] },
        1: { replies: [{ 2: {} }] },
      })
    })

    test('Test subNotesByAuthor() and assert parent notes from other users', async ({ relays, createFeed }) => {
      const authors = ['1']
      const [relay] = relays

      const feed = createFeed()
      feed.subNotesByAuthors(authors)
      // Assert subscription sent
      const reqId = await expectMessage(relay, { kinds: [Kind.Text, Kind.Article], authors })
      // Send response
      const note1 = fakeNote({ id: '1', pubkey: '1', tags: [['e', '2']] }) // reply
      await sendMessages(relay, reqId, [note1])
      await expectMessage(
        relay,
        { kinds: [Kind.Metadata, Kind.RelayList, Kind.Text, Kind.Article], authors }, // requested second page since no root notes were found
        { kinds: [Kind.Text, Kind.Article], ids: ['2'] }, // requested the parent note
      )
      // Send back parent note
      const note2 = fakeNote({ id: '2', pubkey: '2' }) // root from other user
      await sendMessages(relay, reqId, [note2])
      // Assert getting user for parent note
      await expectMessage(relay, { kinds: [Kind.Metadata, Kind.RelayList], authors: ['2'] })
      // Assert feed
      expect(relay.messages).toHaveLength(3)
      expect(getJSONFeed(feed.feed)).toStrictEqual({ 2: { replies: [{ 1: {} }] } })
    })

    test('Test subNotesByAuthor() and assert referenced from `q` tags', async ({ relays, createFeed }) => {
      const authors = ['1']
      const [relay] = relays

      const feed = createFeed()
      // return
      feed.subNotesByAuthors(authors)
      const reqId = await expectMessage(relay, { kinds: [Kind.Text, Kind.Article], authors })

      const note1 = fakeNote({
        id: '1',
        pubkey: '1',
        tags: [
          ['q', '2'],
          ['p', '2'],
        ],
      }) // reply
      await sendMessages(relay, reqId, [note1])

      await expectMessage(
        relay,
        { kinds: [Kind.Metadata, Kind.RelayList], authors: ['1', '2'] },
        { kinds: [Kind.Text, Kind.Article], ids: ['2'] }, // requested the parent note
      )

      // Send back `q` note (which also has another `q` tag)
      const qnote = fakeNote({ id: '2', pubkey: '5', tags: [['q', '5']] })
      await sendMessages(relay, reqId, [qnote])

      await expectMessage(
        relay,
        { kinds: [Kind.Metadata, Kind.RelayList], authors: ['5'] },
        { kinds: [Kind.Text, Kind.Article], ids: ['5'] }, // requested the parent note
      )
    })
  })
  describe('Relay Hints', () => {
    test('Test relay hints from quoted notes (twice)', async ({ relays, createFeed }) => {
      const authors = ['1']
      const [relay1, relay2, relay3] = relays

      const feed = createFeed()
      feed.subNotesByAuthors(authors)
      const reqId = await expectMessage(relay1, { kinds: [Kind.Text, Kind.Article], authors })

      const note1 = fakeNote({
        id: '1',
        pubkey: '1',
        tags: [
          ['q', '2', RELAY_2, ''],
          ['p', '2'],
        ],
      })
      await sendMessages(relay1, reqId, [note1])
      await expectMessage(
        relay1,
        { kinds: [Kind.Metadata, Kind.RelayList], authors: ['1', '2'] },
        { kinds: [Kind.Text, Kind.Article], ids: ['2'] },
      )
      const reqId2 = await expectMessage(relay2, { kinds: [Kind.Text, Kind.Article], ids: ['2'] })
      await delay()
      expect(relay1.messages).toHaveLength(2)

      const note2 = fakeNote({
        id: '2',
        pubkey: '2',
        tags: [
          ['q', '3', RELAY_3, ''],
          ['p', '3'],
        ],
      })
      await sendMessages(relay2, reqId2, [note2])

      await expectMessage(
        relay1,
        { kinds: [Kind.Metadata, Kind.RelayList], authors: ['2', '3'] },
        { kinds: [Kind.Text, Kind.Article], ids: ['3'] },
      )
      await expectMessage(relay3, { kinds: [Kind.Text, Kind.Article], ids: ['3'] })
    })
  })
})
