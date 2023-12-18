import { Kind } from 'constants/kinds'
import { Relay } from 'stores/core/relay'
import { SubscriptionEvents } from 'stores/core/subscription'
import { fakeUser } from 'utils/faker'
import { RELAY_1, test } from 'utils/fixtures'
import { expectMessage, sendMessages } from 'utils/testHelpers'
import { vi } from 'vitest'

describe('Relay', () => {
  test('Test simple subscription and assert events', async ({ relays, createSubscription }) => {
    const stub = vi.fn()
    const [server] = relays
    const relay = new Relay(RELAY_1)
    const sub = createSubscription({ kinds: [Kind.Metadata], authors: ['1'] })

    relay.subscribe(sub, ...sub.filtersData)
    relay.onEvent$.subscribe(stub)

    await expectMessage(server, ...sub.filtersData)
    expect(stub).not.toBeCalled()

    const response = fakeUser()
    await sendMessages(server, sub.id, [response])

    const args = stub.mock.calls.flat(Infinity)
    expect(args).toHaveLength(3)
    expect(args[0]).toStrictEqual(SubscriptionEvents.EVENT)
    expect(args[1]).toStrictEqual(expect.any(String))
    expect(args[2]).toStrictEqual(response)
  })
})
