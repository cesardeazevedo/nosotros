import { RELAY_2, RELAY_3, test } from 'utils/fixtures'
import { delay } from 'utils/testHelpers'
import { vi } from 'vitest'
import { FilterRelay, FilterRelayGroup } from '../filterRelay'
import { RelayHintsData } from '../relayHints'

describe('FilterRelays', () => {
  test('Shoudl expect filter split based on relayList', async ({ root, createFilter, createRelayList }) => {
    const relayHints: RelayHintsData = {
      authors: {
        '1': ['wss://relay1.com', 'wss://relay2.com'],
        '2': ['wss://relay3.com', 'wss://relay4.com'],
        '3': ['wss://relay1.com'],
      },
    }
    await createRelayList({ pubkey: '5', tags: [['r', 'wss://relay5.com']] })
    await createRelayList({ pubkey: '6', tags: [['r', 'wss://relay1.com']] })
    const filter = createFilter({ kinds: [0], authors: ['1', '2', '3', '4', '5', '6'] })
    const filterRelay = new FilterRelay(root, filter.data, relayHints)
    await filterRelay.parse()
    expect(filterRelay.result).toStrictEqual({
      'wss://relay1.com': { kinds: [0], authors: ['1', '3', '6'] },
      'wss://relay2.com': { kinds: [0], authors: ['1'] },
      'wss://relay3.com': { kinds: [0], authors: ['2'] },
      'wss://relay4.com': { kinds: [0], authors: ['2'] },
      'wss://relay5.com': { kinds: [0], authors: ['5'] },
    })
  })

  test('Should expect pending authors from missing relay authors together with relayHints', async ({
    root,
    createFilter,
    createRelayList,
  }) => {
    const hints: RelayHintsData = {
      authors: { '1': [RELAY_2], '2': [RELAY_3] },
    }
    const filter = createFilter({ kinds: [0], authors: ['1', '2', '3', '4'] }).data
    const filterRelay = new FilterRelay(root, filter, hints)

    await filterRelay.parse()
    expect(filterRelay.result).toStrictEqual({
      [RELAY_2]: { ...filter, authors: ['1'] },
      [RELAY_3]: { ...filter, authors: ['2'] },
    })
    expect(filterRelay.pending).toStrictEqual({ ...filter, authors: ['3', '4'] })

    await createRelayList({ pubkey: '3', tags: [['r', RELAY_3]] })

    await filterRelay.parse()
    expect(filterRelay.result).toStrictEqual({ [RELAY_3]: { ...filter, authors: ['3'] } })
    expect(filterRelay.pending).toStrictEqual({ ...filter, authors: ['4'] })

    await createRelayList({ pubkey: '4', tags: [['r', RELAY_2]] })

    await filterRelay.parse()
    expect(filterRelay.result).toStrictEqual({ [RELAY_2]: { ...filter, authors: ['4'] } })
    expect(filterRelay.pending).toStrictEqual(null)
  })

  test('Should expect pending filter ids', async ({ root, createFilter }) => {
    const filter = createFilter({ kinds: [0], ids: ['1', '2'] }).data
    const filterRelay = new FilterRelay(root, filter)

    filterRelay.hints = { ids: { '1': [RELAY_2] } }

    await filterRelay.parse()
    expect(filterRelay.result).toStrictEqual({ [RELAY_2]: { ...filter, ids: ['1'] } })
    expect(filterRelay.pending).toStrictEqual({ ...filter, ids: ['2'] })

    filterRelay.hints = { ids: { '1': [RELAY_2], '2': [RELAY_3] } }

    await filterRelay.parse()
    expect(filterRelay.result).toStrictEqual({ [RELAY_3]: { ...filter, ids: ['2'] } })
    expect(filterRelay.pending).toStrictEqual(null)
  })

  test('Should expect ids being mapped to authors based on the fallback data', async ({
    root,
    createFilter,
    createRelayList,
  }) => {
    const hints: RelayHintsData = {
      fallback: { '1': ['10', '11', '12', '13'], '2': ['14', '15'] },
    }

    const filter = createFilter({ kinds: [0], ids: ['1', '2'] }).data
    const filterRelay = new FilterRelay(root, filter, hints)

    await createRelayList({ pubkey: '10', tags: [['r', RELAY_2]] })
    await createRelayList({ pubkey: '11', tags: [['r', RELAY_3]] })

    await filterRelay.parse()
    expect(filterRelay.result).toStrictEqual({
      [RELAY_2]: { ...filter, ids: ['1'] },
      [RELAY_3]: { ...filter, ids: ['1'] },
    })
    expect(filterRelay.pending).toStrictEqual({ ...filter, ids: ['2'] })

    await createRelayList({ pubkey: '14', tags: [['r', RELAY_3]] })
    await filterRelay.parse()
    expect(filterRelay.result).toStrictEqual({ [RELAY_3]: { ...filter, ids: ['2'] } })
    expect(filterRelay.pending).toStrictEqual(null)
  })

  test('Should expect #e ref ids being mapped to authors based on the fallback data', async ({
    root,
    createFilter,
    createRelayList,
  }) => {
    const hints: RelayHintsData = {
      fallback: { '1': ['10', '11', '12'], '2': ['14', '15'] },
    }
    const filter = createFilter({ kinds: [0], '#e': ['1', '2'] }).data
    const filterRelay = new FilterRelay(root, filter, hints)

    await createRelayList({ pubkey: '10', tags: [['r', RELAY_2]] })
    await createRelayList({ pubkey: '11', tags: [['r', RELAY_3]] })
    await filterRelay.parse()
    expect(filterRelay.result).toStrictEqual({
      [RELAY_2]: { ...filter, '#e': ['1'] },
      [RELAY_3]: { ...filter, '#e': ['1'] },
    })
    expect(filterRelay.pending).toStrictEqual({ ...filter, '#e': ['2'] })
  })
})

describe('FilterRelaysGroup', () => {
  test(
    'Should expect subscription callback being called after receives a new relayList',
    async ({ root, createFilter, createRelayList }) => {
      const filters = [
        createFilter({ kinds: [0], authors: ['1', '2'] }).data,
        createFilter({ kinds: [0], authors: ['3', '4'] }).data,
      ]
      const hints: RelayHintsData = { fallback: { '1': ['5'] } }
      const filterRelay = new FilterRelayGroup(root, filters, hints)
      await filterRelay.prepare()
      expect(filterRelay.pendingAuthors).toStrictEqual(['1', '2', '3', '4', '5'])
      expect(filterRelay.pendings).toStrictEqual([
        { kinds: [0], authors: ['1', '2'] },
        { kinds: [0], authors: ['3', '4'] },
      ])

      // Start listening to relay list
      const callback = vi.fn()
      filterRelay.subscribeToPendingRelayList(callback)

      await createRelayList({ pubkey: '10', tags: [['r', RELAY_2]] }) // unrelated author
      await createRelayList({ pubkey: '1', tags: [['r', RELAY_2]] })
      await delay(2100) // wait for mobx reaction timeout
      expect(callback).toBeCalledTimes(1)
      expect(filterRelay.results).toStrictEqual(new Map([[RELAY_2, [{ kinds: [0], authors: ['1'] }]]]))
      expect(filterRelay.pendings).toStrictEqual([
        { kinds: [0], authors: ['2'] },
        { kinds: [0], authors: ['3', '4'] },
      ])

      // same author relay, shouldn't trigger callback
      await createRelayList({ pubkey: '1', tags: [['r', RELAY_2]] })
      await delay(2100) // wait for mobx reaction timeout
      expect(callback).toBeCalledTimes(1)
      expect(filterRelay.results).toStrictEqual(new Map()) // result was already processed
      expect(filterRelay.pendings).toStrictEqual([
        { kinds: [0], authors: ['2'] },
        { kinds: [0], authors: ['3', '4'] },
      ])

      await createRelayList({ pubkey: '2', tags: [['r', RELAY_2]] })
      await delay(2100)
      expect(callback).toBeCalledTimes(2)
      expect(filterRelay.results).toStrictEqual(new Map([[RELAY_2, [{ kinds: [0], authors: ['2'] }]]]))
      expect(filterRelay.pendings).toStrictEqual([{ kinds: [0], authors: ['3', '4'] }])

      await createRelayList({ pubkey: '3', tags: [['r', RELAY_3]] })
      await createRelayList({
        pubkey: '4',
        tags: [
          ['r', RELAY_2],
          ['r', RELAY_3],
        ],
      })
      await delay(2100) // wait for mobx reaction timeout
      expect(callback).toBeCalledTimes(3)
      expect(filterRelay.results).toStrictEqual(
        new Map([
          [RELAY_2, [{ kinds: [0], authors: ['4'] }]],
          [RELAY_3, [{ kinds: [0], authors: ['3', '4'] }]],
        ]),
      )
      expect(filterRelay.pendings).toStrictEqual([])
    },
    { timeout: 10000 },
  )

  test('Should expect subscription callback being called after receives a new NIP05 data', async ({
    root,
    createFilter,
  }) => {
    const filters = [createFilter({ kinds: [0], authors: ['1'] }).data]
    const filterRelay = new FilterRelayGroup(root, filters)
    await filterRelay.prepare()
    expect(filterRelay.pendingAuthors).toStrictEqual(['1'])
    expect(filterRelay.results).toStrictEqual(new Map())
    expect(filterRelay.pendings).toStrictEqual([{ kinds: [0], authors: ['1'] }])

    const callback = vi.fn()
    filterRelay.subscribeToPendingRelayList(callback)
    root.userRelays.relaysNIP05.set('1', { pubkey: '1', relays: [RELAY_2, RELAY_3] })
    await delay(2100)

    expect(Object.fromEntries(filterRelay.results)).toStrictEqual({
      [RELAY_2]: [{ kinds: [0], authors: ['1'] }],
      [RELAY_3]: [{ kinds: [0], authors: ['1'] }],
    })
    expect(filterRelay.pendings).toStrictEqual([])
  })

  test(
    'Should expect subscription callback after receives new relay lists from the fallback authors',
    async ({ root, createFilter, createRelayList }) => {
      const filters = [
        createFilter({ kinds: [0], ids: ['1', '2'] }).data,
        createFilter({ kinds: [0], ids: ['3', '4'] }).data,
      ]
      const hints = {
        fallback: { '1': ['11'], '2': ['12'], '3': ['13'], '4': ['14'] },
      }
      const filterRelay = new FilterRelayGroup(root, filters, hints)

      await filterRelay.prepare()
      expect(filterRelay.pendingAuthors).toStrictEqual(['11', '12', '13', '14'])
      expect(filterRelay.results).toStrictEqual(new Map())
      expect(filterRelay.pendings).toStrictEqual([
        { kinds: [0], ids: ['1', '2'] },
        { kinds: [0], ids: ['3', '4'] },
      ])

      const callback = vi.fn()
      filterRelay.subscribeToPendingRelayList(callback)

      await createRelayList({ pubkey: '11', tags: [['r', RELAY_2]] })
      await delay(2100) // wait for mobx reaction timeout
      expect(callback).toBeCalledTimes(1)
      expect(filterRelay.results).toStrictEqual(new Map([[RELAY_2, [{ kinds: [0], ids: ['1'] }]]]))
      expect(filterRelay.pendings).toStrictEqual([
        { kinds: [0], ids: ['2'] },
        { kinds: [0], ids: ['3', '4'] },
      ])

      await createRelayList({ pubkey: '12', tags: [['r', RELAY_3]] })
      await delay(2100)
      expect(callback).toBeCalledTimes(2)
      expect(filterRelay.results).toStrictEqual(new Map([[RELAY_3, [{ kinds: [0], ids: ['2'] }]]]))
      expect(filterRelay.pendings).toStrictEqual([{ kinds: [0], ids: ['3', '4'] }])

      await createRelayList({ pubkey: '13', tags: [['r', RELAY_2]] })
      await createRelayList({ pubkey: '14', tags: [['r', RELAY_3]] })
      await delay(2100)
      expect(callback).toBeCalledTimes(3)
      expect(filterRelay.results).toStrictEqual(
        new Map([
          [RELAY_2, [{ kinds: [0], ids: ['3'] }]],
          [RELAY_3, [{ kinds: [0], ids: ['4'] }]],
        ]),
      )
      expect(filterRelay.pendings).toStrictEqual([])
    },
    { timeout: 8000 },
  )
})
