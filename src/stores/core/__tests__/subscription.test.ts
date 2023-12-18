import { Kind } from 'constants/kinds'
import { MessageTypes } from 'stores/core/relay'
import { SubscriptionEvents, SubscriptionGroup } from 'stores/core/subscription'
import { fakeNote } from 'utils/faker'
import { RELAY_1, RELAY_2, RELAY_3, test } from 'utils/fixtures'
import { delay, expectMessage, sendMessages } from 'utils/testHelpers'
import { vi } from 'vitest'
import { RelayHintsData } from '../relayHints'

describe('Subscription', () => {
  test('Should expect subscription event, eose and next event being called', async ({ relays, createSubscription }) => {
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
    await delay()
    expect(eoseNextStub).toHaveBeenCalledTimes(1)
    expect(relayEventNextStub).toHaveBeenCalledTimes(1)
  })

  test('Should expect a `CLOSE` message after call `stop()`', async ({ relays, createSubscription }) => {
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

  test('Should expect only one message was sent for the fixed relay + relayList', async ({
    relays,
    createRelayList,
    createSubscription,
  }) => {
    // We don't want send subscription from userRelays that are part of our fixed relays
    const [relay1] = relays
    await createRelayList({ pubkey: '1', tags: [['r', RELAY_1]] })
    await createSubscription({ kinds: [Kind.Text], authors: ['1', '2', '3'] }).start()
    await expectMessage(relay1, { kinds: [Kind.Text], authors: ['1', '2', '3'] })
    await delay(1000)
    expect(relay1.messages).toHaveLength(1)
  })

  test(
    'Should expect messages to relays after receive a new relay list',
    async ({ relays, createRelayList, createSubscription }) => {
      const [relay1, relay2, relay3] = relays
      await createRelayList({ pubkey: '10', tags: [['r', RELAY_2]] })
      const sub = createSubscription({ kinds: [Kind.Text], authors: ['10', '11', '12'] })
      await sub.start()
      await expectMessage(relay1, { kinds: [Kind.Text], authors: ['10', '11', '12'] })
      await expectMessage(relay2, { kinds: [Kind.Text], authors: ['10'] })
      // User 11 and 12 are pending relay list
      expect(sub.filterRelays.pendings).toStrictEqual([
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
      await sendMessages(relay1, reqId, [await createRelayList({ pubkey: '11', tags: [['r', RELAY_2]] })])

      await expectMessage(relay2, { kinds: [Kind.Text], authors: ['11'] })
      await expectMessage(relay2, { kinds: [Kind.RelayList], authors: ['11'] })
      expect(relay2.messages).toHaveLength(3)

      // Send relay list for user 12 and assert pending messages for user 11
      await sendMessages(relay1, reqId, [await createRelayList({ pubkey: '12', tags: [['r', RELAY_3]] })])
      // relay3 = await getRelay3()
      await expectMessage(relay3, { kinds: [Kind.Text], authors: ['12'] })
      await expectMessage(relay3, { kinds: [Kind.RelayList], authors: ['12'] })

      await delay(1000)
      expect(relay1.messages).toHaveLength(2)
      expect(relay2.messages).toHaveLength(3)
      expect(relay3.messages).toHaveLength(2)
    },
    { timeout: 8000 },
  )

  test('Should expect messages on the relays based on the relayHints provided', async ({
    relays,
    createRelayList,
    createSubscription,
  }) => {
    await createRelayList({ pubkey: '4', tags: [['r', RELAY_2]] })

    const relayHints: RelayHintsData = {
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
    await delay(1200)

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
  test('Should expect merge 2 subscriptions and assert each event for each author [1, 2]', async ({
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

    expect(stub1).toHaveBeenCalledTimes(1)
    expect(stub2).toHaveBeenCalledTimes(1)
    expect(stub3).toHaveBeenCalledTimes(2)
  })

  test('Should expect merged relayHints from the subscription merger', ({ root, createSubscription }) => {
    const hint1: RelayHintsData = { authors: { '1': [RELAY_1] } }
    const hint2: RelayHintsData = { authors: { '2': [RELAY_2] } }
    const sub1 = createSubscription({ kinds: [Kind.Text], authors: ['1'] }, { relayHints: hint1 })
    const sub2 = createSubscription({ kinds: [Kind.Text], authors: ['2'] }, { relayHints: hint2 })
    const parent = new SubscriptionGroup(root, [sub1, sub2])

    expect(parent.filterRelays.hints).toStrictEqual({
      authors: {
        '1': [RELAY_1],
        '2': [RELAY_2],
      },
    })
  })
})
