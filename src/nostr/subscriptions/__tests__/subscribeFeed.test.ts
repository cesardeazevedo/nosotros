import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_FALLBACK_1, RELAY_OUTBOX_1 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeFeed } from '../subscribeFeed'

describe('subscribeFeed', () => {
  test('assert feed options', async ({ createMockRelay }) => {
    const note1 = fakeEvent({ id: '1', pubkey: '1' })
    const note2 = fakeEvent({ id: '2', pubkey: '2', tags: [['e', '1', '', 'root']] })
    const note3 = fakeEvent({
      id: '3',
      pubkey: '1',
      tags: [
        ['e', '1', '', 'root'],
        ['e', '2', '', 'reply'],
      ],
    })

    const relay = createMockRelay(RELAY_1, [note1, note2, note3])
    const relayOutbox = createMockRelay(RELAY_OUTBOX_1, [])
    const relayFallback = createMockRelay(RELAY_FALLBACK_1, [])

    const ctx = { relays: [RELAY_1] }
    const filter = { kinds: [Kind.Text], authors: ['1'] }

    // Only replies
    const $1 = subscribeFeed({ kinds: [Kind.Text], authors: ['1', '2'] }, ctx, {
      includeRoot: false,
      includeParents: false,
      includeReplies: true,
    })
    // Only root
    const $2 = subscribeFeed(filter, ctx, { includeRoot: true, includeParents: false, includeReplies: false })
    // Parent
    const $3 = subscribeFeed({ kinds: [Kind.Text], authors: ['2'] }, ctx, {
      includeRoot: true,
      includeParents: true,
      includeReplies: false,
    })

    const spy = subscribeSpyTo($1)
    const spy2 = subscribeSpyTo($2)
    const spy3 = subscribeSpyTo($3)
    await spy.onComplete()
    await spy2.onComplete()
    await spy3.onComplete()
    await relay.close()
    await relayOutbox.close()
    await relayFallback.close()
    expect(spy.getValues().map((x) => x.id)).toStrictEqual(['2', '3'])
    expect(spy2.getValues().map((x) => x.id)).toStrictEqual(['1'])
    expect(spy3.getValues().map((x) => x.id)).toStrictEqual(['1'])
  })
})
