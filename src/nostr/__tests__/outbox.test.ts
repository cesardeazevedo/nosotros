import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'

describe('OutboxTracker', async () => {
  test('assert idHints', async ({ createClient, insertRelayList }) => {
    await insertRelayList({
      pubkey: 'p1',
      tags: [
        ['r', 'relay1'],
        ['r', 'relay2'],
      ],
    })
    await insertRelayList({ pubkey: 'p2', tags: [['r', 'relay2']] })
    await insertRelayList({ pubkey: 'p3', tags: [['r', 'relay3']] })
    await insertRelayList({ pubkey: 'p4', tags: [['r', 'relay4']] })
    await insertRelayList({ pubkey: 'p5', tags: [['r', 'relay5']] })

    const client = createClient()
    const $ = client.outboxTracker.subscribe(
      [
        {
          kinds: [0],
          ids: ['1', '2', '3', '4', '5'],
          limit: 1,
        },
      ],
      {
        idHints: {
          '1': ['p1'],
          '2': ['p2'],
          '3': ['p3'],
          '4': ['p4'],
          '5': ['p5'],
        },
      },
    )

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      ['relay1', [{ kinds: [0], limit: 1, ids: ['1'] }]],
      ['relay2', [{ kinds: [0], limit: 1, ids: ['1'] }]],
      ['relay2', [{ kinds: [0], limit: 1, ids: ['2'] }]],
      ['relay3', [{ kinds: [0], limit: 1, ids: ['3'] }]],
      ['relay4', [{ kinds: [0], limit: 1, ids: ['4'] }]],
      ['relay5', [{ kinds: [0], limit: 1, ids: ['5'] }]],
    ])
  })

  test('assert authors', async ({ createClient, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', 'relay1'],
        ['r', 'relay2'],
      ],
    })
    await insertRelayList({ pubkey: '2', tags: [['r', 'relay2']] })
    await insertRelayList({ pubkey: '3', tags: [['r', 'relay3']] })
    await insertRelayList({ pubkey: '4', tags: [['r', 'relay4']] })
    await insertRelayList({ pubkey: '5', tags: [['r', 'relay5']] })

    const client = createClient()
    const $ = client.outboxTracker.subscribe([
      {
        kinds: [0],
        authors: ['1', '2', '3', '4', '5'],
        limit: 1,
      },
    ])

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      ['relay1', [{ kinds: [0], limit: 1, authors: ['1'] }]],
      ['relay2', [{ kinds: [0], limit: 1, authors: ['1'] }]],
      ['relay2', [{ kinds: [0], limit: 1, authors: ['2'] }]],
      ['relay3', [{ kinds: [0], limit: 1, authors: ['3'] }]],
      ['relay4', [{ kinds: [0], limit: 1, authors: ['4'] }]],
      ['relay5', [{ kinds: [0], limit: 1, authors: ['5'] }]],
    ])
  })

  test('assert #p', async ({ createClient, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', 'relay1'],
        ['r', 'relay2'],
      ],
    })
    await insertRelayList({ pubkey: '2', tags: [['r', 'relay2']] })
    await insertRelayList({ pubkey: '3', tags: [['r', 'relay3']] })
    await insertRelayList({ pubkey: '4', tags: [['r', 'relay4']] })
    await insertRelayList({ pubkey: '5', tags: [['r', 'relay5']] })

    const client = createClient()
    const $ = client.outboxTracker.subscribe([
      {
        kinds: [0],
        '#p': ['1', '2', '3', '4', '5'],
        limit: 1,
      },
    ])

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      ['relay1', [{ kinds: [0], limit: 1, '#p': ['1'] }]],
      ['relay2', [{ kinds: [0], limit: 1, '#p': ['1'] }]],
      ['relay2', [{ kinds: [0], limit: 1, '#p': ['2'] }]],
      ['relay3', [{ kinds: [0], limit: 1, '#p': ['3'] }]],
      ['relay4', [{ kinds: [0], limit: 1, '#p': ['4'] }]],
      ['relay5', [{ kinds: [0], limit: 1, '#p': ['5'] }]],
    ])
  })
})
