import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { PaginationSubject } from '@/core/PaginationRangeSubject'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { merge, takeUntil, timer } from 'rxjs'
import { subscribeFeedFollowing } from '../subscribeFeedFollowing'

test('subscribeFeedFollowing', async ({ createMockRelay, createContext }) => {
  const note1 = fakeEvent({ id: '1', pubkey: '2', content: 'note' })
  const note2 = fakeEvent({ id: '2', pubkey: '2', content: 'note', tags: [['e', '3', '', 'root']] })
  const note3 = fakeEvent({ id: '3', pubkey: '3', content: 'note', tags: [] })
  const follows = fakeEvent({ kind: Kind.Follows, tags: [['p', '2']] })

  const relay = createMockRelay(RELAY_1, [follows, note1, note2, note3])

  const client = createContext({ relays: [RELAY_1], settings: { outbox: false } })
  const pagination$ = new PaginationSubject({ kinds: [Kind.Text], authors: ['1'] })

  const $ = subscribeFeedFollowing(pagination$, client, {
    includeParents: true,
    includeReplies: false,
  })
  // needs a better way to complete the pagination subject
  const spy = subscribeSpyTo(merge($.pipe(takeUntil(timer(5000)))))
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
    ],
    ['CLOSE', '2'],
    ['REQ', '3', { kinds: [0, 10002], authors: ['2'] }, { ids: ['3'] }],
    ['CLOSE', '3'],
    ['REQ', '4', { authors: ['3'], kinds: [0, 10002] }],
    ['CLOSE', '4'],
  ])

  expect(spy.getValues().map((x) => x.id)).toStrictEqual(['1', '3'])
})
