import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, RELAY_5 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { trackOutbox } from '../trackOutbox'

describe('trackOutbox', async () => {
  test('assert idHints', async ({ createContext, insertRelayList }) => {
    await insertRelayList({
      pubkey: 'p1',
      tags: [
        ['r', RELAY_1],
        ['r', RELAY_2],
      ],
    })
    await insertRelayList({ pubkey: 'p2', tags: [['r', RELAY_2]] })
    await insertRelayList({ pubkey: 'p3', tags: [['r', RELAY_3]] })
    await insertRelayList({ pubkey: 'p4', tags: [['r', RELAY_4]] })
    await insertRelayList({ pubkey: 'p5', tags: [['r', RELAY_5]] })

    const ctx = createContext()
    const $ = trackOutbox(
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
      ctx,
    )

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, [{ kinds: [0], limit: 1, ids: ['1'] }]],
      [RELAY_2, [{ kinds: [0], limit: 1, ids: ['1'] }]],
      [RELAY_2, [{ kinds: [0], limit: 1, ids: ['2'] }]],
      [RELAY_3, [{ kinds: [0], limit: 1, ids: ['3'] }]],
      [RELAY_4, [{ kinds: [0], limit: 1, ids: ['4'] }]],
      [RELAY_5, [{ kinds: [0], limit: 1, ids: ['5'] }]],
    ])
  })

  test('assert authors', async ({ createContext, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', RELAY_1],
        ['r', RELAY_2],
      ],
    })
    await insertRelayList({ pubkey: '2', tags: [['r', RELAY_2]] })
    await insertRelayList({ pubkey: '3', tags: [['r', RELAY_3]] })
    await insertRelayList({ pubkey: '4', tags: [['r', RELAY_4]] })
    await insertRelayList({ pubkey: '5', tags: [['r', RELAY_5]] })

    const ctx = createContext()
    const $ = trackOutbox(
      [
        {
          kinds: [0],
          authors: ['1', '2', '3', '4', '5'],
          limit: 1,
        },
      ],
      {},
      ctx,
    )

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, [{ kinds: [0], limit: 1, authors: ['1'] }]],
      [RELAY_2, [{ kinds: [0], limit: 1, authors: ['1'] }]],
      [RELAY_2, [{ kinds: [0], limit: 1, authors: ['2'] }]],
      [RELAY_3, [{ kinds: [0], limit: 1, authors: ['3'] }]],
      [RELAY_4, [{ kinds: [0], limit: 1, authors: ['4'] }]],
      [RELAY_5, [{ kinds: [0], limit: 1, authors: ['5'] }]],
    ])
  })

  test('assert #p', async ({ createContext, insertRelayList }) => {
    await insertRelayList({
      pubkey: '1',
      tags: [
        ['r', RELAY_1],
        ['r', RELAY_2],
      ],
    })
    await insertRelayList({ pubkey: '2', tags: [['r', RELAY_2]] })
    await insertRelayList({ pubkey: '3', tags: [['r', RELAY_3]] })
    await insertRelayList({ pubkey: '4', tags: [['r', RELAY_4]] })
    await insertRelayList({ pubkey: '5', tags: [['r', RELAY_5]] })

    const ctx = createContext()
    const $ = trackOutbox(
      [
        {
          kinds: [0],
          '#p': ['1', '2', '3', '4', '5'],
          limit: 1,
        },
      ],
      {},
      ctx,
    )

    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, [{ kinds: [0], limit: 1, '#p': ['1'] }]],
      [RELAY_2, [{ kinds: [0], limit: 1, '#p': ['1'] }]],
      [RELAY_2, [{ kinds: [0], limit: 1, '#p': ['2'] }]],
      [RELAY_3, [{ kinds: [0], limit: 1, '#p': ['3'] }]],
      [RELAY_4, [{ kinds: [0], limit: 1, '#p': ['4'] }]],
      [RELAY_5, [{ kinds: [0], limit: 1, '#p': ['5'] }]],
    ])
  })

  test('assert #e field for when passing idHints', async ({ createContext, insertRelayList }) => {
    await insertRelayList({ pubkey: '1', tags: [['r', RELAY_1]] })
    await insertRelayList({ pubkey: '2', tags: [['r', RELAY_2]] })
    await insertRelayList({ pubkey: '3', tags: [['r', RELAY_3]] })
    const ctx = createContext()
    const $ = trackOutbox(
      [
        {
          kinds: [0],
          '#e': ['1', '2', '3', '4', '5'],
        },
      ],
      {
        idHints: {
          1: ['1'],
          2: ['2', '3'],
        },
      },
      ctx,
    )
    const spy = subscribeSpyTo($)
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      ['wss://relay1.com', [{ kinds: [0], '#e': ['1'] }]],
      ['wss://relay2.com', [{ kinds: [0], '#e': ['2'] }]],
      ['wss://relay3.com', [{ kinds: [0], '#e': ['2'] }]],
    ])
  })
})
