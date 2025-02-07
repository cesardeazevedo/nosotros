import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { fakeNote } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { subscribeFeed } from '../subscribeFeed'

describe('subscribeFeed', () => {
  test('assert includeReplies', async ({ createMockRelay, createClient }) => {
    const note1 = fakeNote({ id: '1', pubkey: '1', content: 'note' })
    const note2 = fakeNote({ id: '2', pubkey: '1', content: 'note', tags: [['e', '1', '', 'root']] })
    const note3 = fakeNote({
      id: '3',
      pubkey: '1',
      content: 'note',
      tags: [
        ['e', '1', '', 'root'],
        ['e', '2', '', 'reply'],
      ],
    })

    const relay = createMockRelay(RELAY_1, [note1, note2, note3])

    const client = createClient({ relays: [RELAY_1], settings: { outbox: false } })
    const filter = { kinds: [Kind.Text], authors: ['1'] }
    const $ = subscribeFeed(filter, client, { includeParents: false, includeReplies: true })

    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay.close()
    expect(spy.getValues()).toStrictEqual([note2, note3])
  })

  test('assert includeReplies with includeParents', async ({ createMockRelay, createClient }) => {
    const note1 = fakeNote({ id: '1', pubkey: '2', content: 'note' })
    const note2 = fakeNote({ id: '2', pubkey: '1', content: 'note', tags: [['e', '1', '', 'root']] })
    const note3 = fakeNote({
      id: '3',
      pubkey: '1',
      content: 'note',
      tags: [],
    })

    const relay = createMockRelay(RELAY_1, [note1, note2, note3])

    const client = createClient({ relays: [RELAY_1], settings: { outbox: false } })
    const filter = { kinds: [Kind.Text], authors: ['1'] }
    const $ = subscribeFeed(filter, client, { includeParents: true, includeReplies: true })

    const spy = subscribeSpyTo($)
    await spy.onComplete()
    await relay.close()
    expect(spy.getValues()).toStrictEqual([note3, note1])
  })
})
