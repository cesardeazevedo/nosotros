import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_FALLBACK_1, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { PaginationSubject } from '@/core/PaginationSubject'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { merge, takeUntil, timer } from 'rxjs'
import { subscribeFeedFollowing } from '../subscribeFeedFollowing'

test('subscribeFeedFollowing', async ({ createMockRelay }) => {
  const note1 = fakeEvent({ id: '1', pubkey: '2', content: 'note' })
  const note2 = fakeEvent({ id: '2', pubkey: '2', content: 'note', tags: [['e', '3', '', 'root', '3']] })
  const note3 = fakeEvent({ id: '3', pubkey: '3', content: 'note', tags: [] })
  const follows = fakeEvent({ kind: Kind.Follows, pubkey: '1', tags: [['p', '2']] })
  const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
    fakeEvent({ kind: Kind.RelayList, pubkey: '3', tags: [['r', RELAY_2, 'write']] }),
  ])
  const relayFallback = createMockRelay(RELAY_FALLBACK_1, [])

  const relay = createMockRelay(RELAY_1, [follows, note1, note2])
  const relay2 = createMockRelay(RELAY_2, [note3])

  const pagination$ = new PaginationSubject({ kinds: [Kind.Text], authors: ['1'], limit: 10 }, {})

  const $ = subscribeFeedFollowing(
    pagination$,
    { relays: [RELAY_1] },
    {
      includeRoot: true,
      includeParents: true,
      includeReplies: false,
    },
  )
  // needs a better way to complete the pagination subject
  const spy = subscribeSpyTo(merge($.pipe(takeUntil(timer(5000)))))
  await spy.onComplete()
  await relay.close()
  await relay2.close()
  await relayOutbox.close()
  await relayFallback.close()

  expect(relay.received).toStrictEqual([
    ['REQ', '1', { kinds: [3], authors: ['1'] }],
    ['CLOSE', '1'],
    [
      'REQ',
      '2',
      {
        kinds: [1],
        authors: ['1', '2'],
        limit: 10,
      },
    ],
    ['CLOSE', '2'],
    ['REQ', '3', { kinds: [0], authors: ['2'] }, { ids: ['3'] }],
    ['CLOSE', '3'],
    ['REQ', '4', { kinds: [0], authors: ['3'] }],
    ['CLOSE', '4'],
  ])
  expect(relay2.received).toStrictEqual([
    ['REQ', '1', { ids: ['3'] }],
    ['CLOSE', '1'],
    ['REQ', '2', { kinds: [0], authors: ['3'] }],
    ['CLOSE', '2'],
  ])
  expect(spy.getValues().map((x) => x.id)).toStrictEqual(['1', '3'])
})
