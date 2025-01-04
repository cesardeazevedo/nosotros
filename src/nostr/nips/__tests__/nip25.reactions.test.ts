import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { db } from '@/nostr/db'
import { reactionStore } from '@/stores/reactions/reactions.store'
import { fakeNote } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'

describe('NIP25', () => {
  test('assert reactions count locally', async ({ createClient }) => {
    const eventId = '10'
    const base = { kind: Kind.Reaction, pubkey: '1', content: '+', tags: [['e', eventId]] }
    const event1 = fakeNote({ ...base, id: '1', created_at: 10 })
    const event2 = fakeNote({ ...base, id: '2', created_at: 11 })
    const event3 = fakeNote({ ...base, id: '3', created_at: 12 })
    const event4 = fakeNote({ ...base, id: '4', created_at: 13 })

    await db.event.insert(event1)
    await db.event.insert(event2)
    await db.event.insert(event3)
    await db.event.insert(event4)

    const client = createClient({ relays: [RELAY_1], settings: { outbox: false } })
    const filter = { '#e': [eventId] }
    const $ = client.reactions.subscribe(filter, { queryLocal: false })
    const spy = subscribeSpyTo($)
    await spy.onComplete()
    expect(reactionStore.getTotal(eventId)).toBe(4)
  })
})
