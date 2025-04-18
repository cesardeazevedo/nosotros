import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, RELAY_5, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { WRITE } from '@/nostr/types'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { RelayList } from 'nostr-tools/kinds'
import { identity } from 'observable-hooks'
import { mergeMap, toArray } from 'rxjs'
import { getRelaysFromContext } from '../getRelaysFromContext'

describe('getRelaysFromContext', () => {
  test('assert relay outbox with relay sets', async ({ createMockRelay }) => {
    const relay1 = createMockRelay(RELAY_4, [
      fakeEvent({
        kind: Kind.RelaySets,
        pubkey: 'p1',
        tags: [
          ['d', '123'],
          ['relay', RELAY_3],
        ],
      }),
    ])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [
      fakeEvent({
        kind: RelayList,
        pubkey: 'p1',
        tags: [['r', RELAY_4]],
      }),
      fakeEvent({
        kind: RelayList,
        pubkey: 'p2',
        tags: [
          ['r', RELAY_4, 'read'],
          ['r', RELAY_5, 'write'],
        ],
      }),
    ])
    const spy = subscribeSpyTo(
      getRelaysFromContext({
        pubkey: 'p2',
        permission: WRITE,
        relays: [RELAY_1, RELAY_2],
        relaySets: ['p1:123'],
      }).pipe(mergeMap(identity), toArray()),
    )
    await spy.onComplete()
    await relay1.close()
    await relayOutbox.close()
    expect(spy.getValues()).toStrictEqual([[RELAY_1, RELAY_2, RELAY_5, RELAY_3]])
  })
})
