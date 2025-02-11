import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeFollows } from '../subscribeFollows'

test('assert subscribeFollows', async ({ createMockRelay, createContext }) => {
  const relay = createMockRelay(RELAY_1, [
    fakeEvent({
      kind: Kind.Follows,
      id: '1',
      pubkey: '1',
      tags: [
        ['p', '2'],
        ['p', '3'],
      ],
    }),
    fakeEvent({ kind: Kind.Metadata, pubkey: '2' }),
    fakeEvent({ kind: Kind.Metadata, pubkey: '3' }),
    fakeEvent({ kind: Kind.RelayList, pubkey: '2' }),
    fakeEvent({ kind: Kind.RelayList, pubkey: '3' }),
  ])

  const client = createContext({ relays: [RELAY_1], settings: { outbox: true } })
  const $ = subscribeFollows('1', client)

  const spy = subscribeSpyTo($)
  await spy.onComplete()

  expect(relay.received).toStrictEqual([
    ['REQ', '1', { kinds: [3], authors: ['1'] }],
    ['CLOSE', '1'],
  ])
})
