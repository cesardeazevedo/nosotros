import { RELAY_1 } from '@/constants/testRelays'
import { fakeNote } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { expectRelayReceived, relaySendEose, relaySendEvents } from '@/utils/testHelpers'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { parseUser } from '../metadata/parseUser'

describe('NIP01 Users', () => {
  test('assert subscription', async ({ relay, createClient }) => {
    const client = createClient({ relays: [RELAY_1], settings: { outboxEnabled: false } })
    const $ = client.users.subscribe('1')
    const spy = subscribeSpyTo($)

    const reqId = await expectRelayReceived(relay, { kinds: [0, 10002], authors: ['1'] })

    const user = fakeNote({ kind: 0, id: '1', content: '{}', pubkey: '1', created_at: 1 })
    const user2 = fakeNote({ kind: 0, id: '2', content: '{}', pubkey: '1', created_at: 2 })
    const user3 = fakeNote({ kind: 0, id: '3', content: '{}', pubkey: '1', created_at: 3 })

    relaySendEvents(relay, reqId, [user3, user2, user])
    relaySendEose(relay, reqId)

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([[user3, parseUser(user3)]])
  })

  test('assert two simulteneous subscription', async ({ relay, createClient }) => {
    const client = createClient({ relays: [RELAY_1], settings: { outboxEnabled: false } })
    const $1 = client.users.subscribe('1')
    const $2 = client.users.subscribe('1')
    const spy1 = subscribeSpyTo($1)
    const spy2 = subscribeSpyTo($2)

    const reqId = await expectRelayReceived(relay, { kinds: [0, 10002], authors: ['1'] })

    const user = fakeNote({ kind: 0, id: '1', content: '{}', pubkey: '1', created_at: 1 })
    relaySendEvents(relay, reqId, [user])
    relaySendEose(relay, reqId)

    await spy1.onComplete()
    await spy2.onComplete()

    expect(spy1.getValues()).toStrictEqual([[user, parseUser(user)]])
    expect(spy2.getValues()).toStrictEqual([[user, parseUser(user)]])
  })
})
