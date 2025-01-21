import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { PaginationSubject } from '@/core/PaginationRangeSubject'
import { fakeNote } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { delay, merge, take } from 'rxjs'

describe('NostrFeeds', () => {
  test('assert following', async ({ createMockRelay, createClient }) => {
    const note1 = fakeNote({ id: '1', pubkey: '2', content: 'note' })
    const note2 = fakeNote({ id: '2', pubkey: '2', content: 'note', tags: [['e', '3', '', 'root']] })
    const note3 = fakeNote({ id: '3', pubkey: '3', content: 'note', tags: [] })
    const follows = fakeNote({ kind: Kind.Follows, tags: [['p', '2']] })

    const relay = createMockRelay(RELAY_1, [follows, note1, note2, note3])

    const client = createClient({ relays: [RELAY_1], settings: { outbox: false } })
    const pagination$ = new PaginationSubject({ kinds: [Kind.Text], authors: ['1'] })

    const $ = client.feeds.following(pagination$, {
      includeParents: true,
      includeReplies: false,
    })
    // needs a better way to complete the pagination subject
    const spy = subscribeSpyTo(merge($.pipe(delay(2000), take(2))))
    await spy.onComplete()
    await relay.close()

    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [3], authors: ['1'] }],
      ['CLOSE', '1'],
      [
        'REQ',
        '2',
        {
          kinds: [1],
          authors: ['1', '2'],
          since: expect.any(Number),
          until: expect.any(Number),
        },
        { kinds: [0, 10002], authors: ['2'] },
      ],
      ['CLOSE', '2'],
      ['REQ', '3', { ids: ['3'], kinds: [1] }],
      ['CLOSE', '3'],
      ['REQ', '4', { authors: ['3'], kinds: [0, 10002] }],
      ['CLOSE', '4'],
    ])

    expect(spy.getValues().map((x) => x.id)).toStrictEqual(['1', '3'])
  })
})
