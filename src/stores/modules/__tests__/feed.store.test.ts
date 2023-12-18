import { Kind } from 'constants/kinds'
import { fakeNote } from 'utils/faker'
import { test } from 'utils/fixtures'
import { delay, expectMessage, sendMessages } from 'utils/testHelpers'

describe('FeedStore', () => {
  test('Should expect a new note on feed', ({ createFeed, createNote }) => {
    const feed = createFeed()
    const note = createNote({ id: '1' })
    feed.add(note)
    expect(Object.fromEntries(feed.feed)).toEqual({
      '1': note,
    })
  })

  test('Should not expect replies on main feed', ({ createFeed, createNote }) => {
    const feed = createFeed()
    feed.add(createNote({ id: '2', tags: [['e', '1']] }))
    feed.add(createNote({ id: '2', tags: [['e', '1', '', 'reply']] }))
    feed.add(createNote({ id: '2', tags: [['e', '1', '', 'root']] }))
    expect(feed.feed.size).toBe(0)
  })

  test('Should receive a reply and expect the parent note on the feed', async ({ relays, createFeed }) => {
    const authors = ['1']
    const [relay] = relays

    const feed = createFeed()
    feed.subNotesByAuthors(authors)
    // Assert subscription sent
    const reqId = await expectMessage(relay, { kinds: [Kind.Text, Kind.Article], authors })

    const note1 = fakeNote({ id: '1', pubkey: '1', tags: [['e', '2', '', 'reply']] }) // reply
    await sendMessages(relay, reqId, [note1])
    await delay(1100)
    // Assert empty field because it's a reply
    expect(feed.feed.size).toBe(0)
    const reqId2 = await expectMessage(
      relay,
      { kinds: [Kind.Metadata, Kind.RelayList], authors }, // requested second page since no root notes were found
      { ids: ['2'] }, // requested the parent note
    )
    // Send back parent note
    const note2 = fakeNote({ id: '2', pubkey: '2' }) // root from other user
    await sendMessages(relay, reqId2, [note2])
    await expectMessage(relay, { kinds: [Kind.Metadata, Kind.RelayList], authors: ['2'] })
    expect(relay.messages).toHaveLength(3)
    expect(feed.feed.size).toBe(1)
    expect(feed.feed.get('2')?.event).toStrictEqual(note2)
  })

  test('Should expect a subscription and not receiving any note, triggering a pagination', async ({
    createFeed,
    relays,
  }) => {
    const authors = ['1']
    const [relay1] = relays
    const feed = createFeed({ authors, pagination: true, paginationRetryTimeout: 1000 })
    feed.subNotesByAuthors(authors)

    await expectMessage(relay1, {
      kinds: [Kind.Text, Kind.Article],
      authors,
      since: feed.filter.data.since,
      until: feed.filter.data.until,
    })
    expect(relay1.messages).toHaveLength(1)
    await delay(1100)
    await expectMessage(relay1, {
      kinds: [Kind.Text, Kind.Article],
      authors,
      since: feed.filter.data.since,
      until: feed.filter.data.until,
    })
    expect(relay1.messages).toHaveLength(2)
  })
})
