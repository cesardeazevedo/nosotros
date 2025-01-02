import { RELAY_1 } from '@/constants/testRelays'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { Kind } from 'constants/kinds'
import { fakeNote } from 'utils/faker'
import { test } from 'utils/fixtures'

describe('NIP01Notes', () => {
  test('assert related events', async ({ createMockRelay, createClient }) => {
    const relay = createMockRelay(RELAY_1, [
      fakeNote({
        id: '1',
        pubkey: '1',
        tags: [
          ['e', '7', '', 'root'],
          ['e', '3', '', 'reply'],
          ['e', '2', '', 'mention'],
        ],
      }),
      fakeNote({ id: '2', pubkey: '2', tags: [['e', '22', '', 'mention']] }), // test deep quoted notes
      fakeNote({ id: '3', pubkey: '3', tags: [['e', '4', '', 'reply']] }),
      fakeNote({ id: '4', pubkey: '4', tags: [['e', '5', '', 'reply']] }),
      fakeNote({ id: '5', pubkey: '5', tags: [['e', '6', '', 'reply']] }),
      fakeNote({ id: '6', pubkey: '6', tags: [['e', '7', '', 'root']] }),
      fakeNote({ id: '7', pubkey: '7' }),
      fakeNote({ id: '22', pubkey: '2' }), // test deep quoted notes
    ])
    const client = createClient({ relays: [RELAY_1], settings: { outbox: false } })

    const filter = { kinds: [Kind.Text, Kind.Article], authors: ['1'] }
    const spy = subscribeSpyTo(client.notes.subWithRelated(filter))
    await spy.onComplete()
    await relay.close()

    expect(relay.received).toStrictEqual([
      ['REQ', '1', { kinds: [1, 30023], authors: ['1'] }],
      ['CLOSE', '1'],
      ['REQ', '2', { ids: ['7', '3', '2'] }, { kinds: [0, 10002], authors: ['1'] }],
      ['CLOSE', '2'],
      ['REQ', '3', { ids: ['22', '4'] }, { kinds: [0, 10002], authors: ['2', '3', '7'] }],
      ['CLOSE', '3'],
      ['REQ', '4', { ids: ['5'] }, { kinds: [0, 10002], authors: ['4'] }],
      ['CLOSE', '4'],
      ['REQ', '5', { ids: ['6'] }, { kinds: [0, 10002], authors: ['5'] }],
      ['CLOSE', '5'],
      ['REQ', '6', { kinds: [0, 10002], authors: ['6'] }],
      // ['CLOSE', '6'],
    ])

    expect(spy.getValues().map((x) => x.id)).toStrictEqual(['1', '3', '7', '4', '5', '6'])
  })
})
