import { Kind } from 'constants/kinds'
import { MessageTypes } from 'stores/core/relay'
import { RelayHints, SubscriptionEvents, SubscriptionGroup } from 'stores/core/subscription'
import { fakeNote } from 'utils/faker'
import { RELAY_1, RELAY_2, RELAY_3, test } from 'utils/fixtures'
import { delay, expectMessage, sendMessages } from 'utils/testHelpers'
import { vi } from 'vitest'

describe('Test Subscription class', () => {
  describe('Test subscriptions with relays', () => {
    test('test send subscription to relay and match the event streams', async ({ relays, createSubscription }) => {
      const [relay1] = relays
      const sub = createSubscription({
        kinds: [0],
        authors: ['1'],
      })
      await sub.start()

      const relay = sub.relays.get(RELAY_1)
      expect(relay).toBeDefined()
      expect(relay?.url).toBe(RELAY_1)

      await expectMessage(relay1, { kinds: [0], authors: ['1'] })

      const eoseNextStub = vi.fn()
      sub.onEose$.subscribe({ next: eoseNextStub })

      const eventNextStub = vi.fn()
      sub.onEvent$.subscribe({ next: eventNextStub })

      const relayEventNextStub = vi.fn()
      relay?.onEvent$.subscribe({ next: relayEventNextStub })

      const response = fakeNote()
      await relay1.send([SubscriptionEvents.EVENT, sub.id, response])
      await delay()
      expect(eventNextStub).toHaveBeenCalledTimes(1)
      expect(eventNextStub).toHaveBeenCalledWith(response)

      // Assert observable completions after a EOSE
      await relay1.send([SubscriptionEvents.EOSE, sub.id])
      await delay(1000)
      expect(eoseNextStub).toHaveBeenCalledTimes(1)
      expect(relayEventNextStub).toHaveBeenCalledTimes(1)
    })

    test('Test subscribe and unsubscribe', async ({ relays, createSubscription }) => {
      const [relay1] = relays
      const sub = createSubscription({
        kinds: [0],
        authors: ['1'],
      })
      await sub.start()

      await expectMessage(relay1, { kinds: [0], authors: ['1'] })

      sub.stop()
      await expect(relay1).toReceiveMessage([MessageTypes.CLOSE, sub.id])
      expect(Array.from(sub.relays.keys())).toStrictEqual([RELAY_1])
      expect(sub.relays.get(RELAY_1)?.subscriptions.get(sub.id)).toBeUndefined()
    })

    describe('Gossip mode', () => {
      test('Test subscription prepareRelayFilters() and preparePendingFilters()', async ({
        createRelayList,
        createSubscription,
      }) => {
        await createRelayList({ pubkey: '1', tags: [['r', 'wss://relay1.com']] })
        await createRelayList({ pubkey: '2', tags: [['r', 'wss://relay2.com']] })
        await createRelayList({ pubkey: '3', tags: [['r', 'wss://relay3.com']] })
        await createRelayList({
          pubkey: '4',
          tags: [
            ['r', 'wss://relay4.com'],
            ['r', 'wss://relay1.com'],
          ],
        })
        await createRelayList({
          pubkey: '5',
          tags: [
            ['r', 'wss://relay5.com'],
            ['r', 'wss://relay2.com'],
          ],
        })
        await createRelayList({
          pubkey: '6',
          tags: [
            ['r', 'wss://relay6.com'],
            ['r', 'wss://relay3.com'],
          ],
        })

        const sub = createSubscription({
          kinds: [Kind.Text],
          authors: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        })
        await sub.start()
        expect(Object.fromEntries(sub.filtersByRelay)).toStrictEqual({
          'wss://relay1.com': [{ kinds: [Kind.Text], authors: ['1', '4'] }],
          'wss://relay2.com': [{ kinds: [Kind.Text], authors: ['2', '5'] }],
          'wss://relay3.com': [{ kinds: [Kind.Text], authors: ['3', '6'] }],
          'wss://relay4.com': [{ kinds: [Kind.Text], authors: ['4'] }],
          'wss://relay5.com': [{ kinds: [Kind.Text], authors: ['5'] }],
          'wss://relay6.com': [{ kinds: [Kind.Text], authors: ['6'] }],
        })
        expect(sub.filtersPending).toStrictEqual([{ kinds: [Kind.Text], authors: ['7', '8', '9'] }])

        await createRelayList({ pubkey: '7', tags: [['r', RELAY_2]] })
        await delay(1100) // waits for reaction throttle
        expect(Object.fromEntries(sub.filtersByRelay)).toStrictEqual({
          'wss://relay2.com': [{ kinds: [Kind.Text], authors: ['7'] }],
        })
        expect(sub.filtersPending).toStrictEqual([{ kinds: [Kind.Text], authors: ['8', '9'] }])

        await createRelayList({ pubkey: '8', tags: [['r', RELAY_2]] })
        await delay(1100) // waits for reaction throttle
        expect(sub.filtersPending).toStrictEqual([{ kinds: [Kind.Text], authors: ['9'] }])

        await createRelayList({ pubkey: '9', tags: [['r', RELAY_2]] })
        await delay(1100)
        expect(sub.filtersPending).toStrictEqual([{ kinds: [Kind.Text], authors: [] }])
      })

      test('Test subscription of user relays deduped with the fixed relays', async ({
        relays,
        createRelayList,
        createSubscription,
      }) => {
        // We don't want send subscription from userRelays that are part of our fixed relays
        const [relay1] = relays
        await createRelayList({ pubkey: '1', tags: [['r', RELAY_1]] })
        const sub = createSubscription({
          kinds: [Kind.Text],
          authors: ['1', '2', '3'],
        })
        await sub.start()
        await expectMessage(relay1, { kinds: [Kind.Text], authors: ['1', '2', '3'] })
        await delay(1000)
        expect(relay1.messages).toHaveLength(1)
      })

      test('Test subscription of new user relays', async ({ relays, createRelayList, createSubscription }) => {
        const [relay1, relay2, relay3] = relays
        await createRelayList({ pubkey: '10', tags: [['r', RELAY_2]] })
        const sub = createSubscription({ kinds: [Kind.Text], authors: ['10', '11', '12'] })
        await sub.start()
        await expectMessage(relay1, { kinds: [Kind.Text], authors: ['10', '11', '12'] })
        await expectMessage(relay2, { kinds: [Kind.Text], authors: ['10'] })
        // User 11 and 12 are pending relay list
        expect(sub.filtersPending).toStrictEqual([
          {
            authors: ['11', '12'],
            kinds: [Kind.Text],
          },
        ])
        // Get user 11 and 12 relay list
        await createSubscription({
          kinds: [Kind.RelayList],
          authors: ['11', '12'],
        }).start()

        const reqId = await expectMessage(relay1, { kinds: [Kind.RelayList], authors: ['11', '12'] })

        // Send relay list for user 11 and assert pending messages for user 11
        await sendMessages(relay1, reqId, [createRelayList({ pubkey: '11', tags: [['r', RELAY_2]] })])

        await expectMessage(relay2, { kinds: [Kind.Text], authors: ['11'] })
        await expectMessage(relay2, { kinds: [Kind.RelayList], authors: ['11'] })
        expect(relay2.messages).toHaveLength(3)

        // Send relay list for user 12 and assert pending messages for user 11
        await sendMessages(relay1, reqId, [createRelayList({ pubkey: '12', tags: [['r', RELAY_3]] })])
        // relay3 = await getRelay3()
        await expectMessage(relay3, { kinds: [Kind.Text], authors: ['12'] })
        await expectMessage(relay3, { kinds: [Kind.RelayList], authors: ['12'] })

        await delay(1000)
        expect(relay1.messages).toHaveLength(2)
        expect(relay2.messages).toHaveLength(3)
        expect(relay3.messages).toHaveLength(2)
      })

      test('Test relay hints together with user relays', async ({ relays, createRelayList, createSubscription }) => {
        await createRelayList({ pubkey: '4', tags: [['r', RELAY_2]] })

        const relayHints = {
          authors: {
            '1': [RELAY_1],
            '2': [RELAY_2],
            '3': [RELAY_3],
          },
        }
        const sub = createSubscription(
          {
            kinds: [Kind.Text],
            authors: ['1', '2', '3', '4'],
          },
          { relayHints },
        )
        await sub.start()

        const [relay1, relay2, relay3] = relays
        // Fixed relay
        await expectMessage(relay1, { kinds: [Kind.Text], authors: ['1', '2', '3', '4'] })
        // Relay hints
        await expectMessage(relay2, { kinds: [Kind.Text], authors: ['2', '4'] })
        await expectMessage(relay3, { kinds: [Kind.Text], authors: ['3'] })
        await delay(1000)
        expect(relay1.messages).toHaveLength(1)
        expect(relay2.messages).toHaveLength(1)
        expect(relay3.messages).toHaveLength(1)
      })
    })

    describe('SubscriptionGroup', () => {
      test('merge 2 subscriptions and assert each event for each author [1, 2]', async ({
        root,
        relays,
        createSubscription,
      }) => {
        const [relay] = relays
        const stub1 = vi.fn()
        const stub2 = vi.fn()
        const stub3 = vi.fn()
        const sub1 = createSubscription({ kinds: [Kind.Text], authors: ['1'] })
        const sub2 = createSubscription({ kinds: [Kind.Text], authors: ['2'] })
        const parent = new SubscriptionGroup(root, [sub1, sub2])
        expect(parent.subscriptions).toStrictEqual([sub1, sub2])
        expect(sub1.parent).toBe(parent)
        expect(sub2.parent).toBe(parent)

        sub1.onEvent$.subscribe(stub1)
        sub2.onEvent$.subscribe(stub2)
        parent.onEvent$.subscribe(stub3)

        await parent.start()
        await expectMessage(relay, { kinds: [Kind.Text], authors: ['1', '2'] })

        expect(stub1).not.toBeCalled()
        expect(stub2).not.toBeCalled()
        expect(stub3).not.toBeCalled()

        const msg1 = fakeNote({ id: '1', pubkey: '1' })
        await sendMessages(relay, parent.id, [msg1])

        expect(stub1).toHaveBeenCalledWith(msg1)
        expect(stub3).toHaveBeenCalledWith(msg1)

        const msg2 = fakeNote({ id: '2', pubkey: '2' })
        await sendMessages(relay, parent.id, [msg2])

        expect(stub2).toHaveBeenCalledWith(msg2)
        expect(stub3).toHaveBeenCalledWith(msg2)

        // await delay()
        expect(stub1).toHaveBeenCalledTimes(1)
        expect(stub2).toHaveBeenCalledTimes(1)
        expect(stub3).toHaveBeenCalledTimes(2)
      })

      test('Test relay hints merge', async ({ root, createSubscription }) => {
        const relayHints1: RelayHints = {
          authors: {
            '1': [RELAY_1],
          },
        }
        const relayHints2: RelayHints = {
          authors: {
            '2': [RELAY_2],
          },
        }
        const sub1 = createSubscription({ kinds: [Kind.Text], authors: ['1'] }, { relayHints: relayHints1 })
        const sub2 = createSubscription({ kinds: [Kind.Text], authors: ['2'] }, { relayHints: relayHints2 })
        const parent = new SubscriptionGroup(root, [sub1, sub2])

        expect(parent.relayHints).toStrictEqual({
          ids: {},
          authors: {
            '1': [RELAY_1],
            '2': [RELAY_2],
          },
        })
      })
    })
  })
})
