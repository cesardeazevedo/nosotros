import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { Kind } from 'constants/kinds'
import { NostrPublisher } from 'core/NostrPublish'
import { Pool } from 'core/pool'
import type { NostrEvent } from 'nostr-tools'
import { of } from 'rxjs'
import { RELAY_1, RELAY_2, RELAY_3, test } from 'utils/fixtures'
import { expectRelayPublish, relaySendEvents, relaySendNotice, relaySendOK } from 'utils/testHelpers'
import { publish } from '../publish'

describe('publish', () => {
  test('assert relays responses', async ({ relay, relay2, relay3 }) => {
    const pool = new Pool()
    const event = {
      id: '1',
      kind: Kind.Text,
      content: 'Hello',
      pubkey: '1',
      created_at: Date.now(),
      tags: [],
    }

    const publisher = new NostrPublisher(event, {
      relays: of([RELAY_1, RELAY_2, RELAY_3]),
    })

    const $ = of(publisher).pipe(publish(pool))
    const spy = subscribeSpyTo($)

    await expectRelayPublish(relay, event)
    await expectRelayPublish(relay2, event)
    await expectRelayPublish(relay3, event)

    // Relay sending unrelated messages
    relaySendEvents(relay, '1000', [event])
    relaySendNotice(relay, 'msg')

    relaySendOK(relay, [event.id, true, 'status: OK'])
    relaySendOK(relay2, [event.id, true, 'status: OK'])
    relaySendOK(relay3, [event.id, false, 'status: duplicated event'])

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, event.id, true, 'status: OK'],
      [RELAY_2, event.id, true, 'status: OK'],
      [RELAY_3, event.id, false, 'status: duplicated event'],
    ])
  })

  test('assert related events being published', async ({ relay }) => {
    const pool = new Pool()
    const note = {
      id: '1',
      kind: Kind.Text,
      content: 'Hello',
      pubkey: '1',
      created_at: Date.now(),
      sig: '',
      tags: [],
    } as NostrEvent

    const reaction = {
      id: '2',
      kind: Kind.Reaction,
      content: '+',
      pubkey: '2',
      created_at: Date.now(),
      tags: [
        ['p', '1'],
        ['e', '1'],
      ],
    }

    const publisher = new NostrPublisher(reaction, {
      relays: of([RELAY_1]),
      include: of([note]),
    })

    const $ = of(publisher).pipe(publish(pool))
    const spy = subscribeSpyTo($)

    await expectRelayPublish(relay, reaction)
    await expectRelayPublish(relay, note)

    relaySendOK(relay, [reaction.id, true, 'status: OK'])
    relaySendOK(relay, [note.id, true, 'status: OK'])

    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([
      [RELAY_1, reaction.id, true, 'status: OK'],
      [RELAY_1, note.id, true, 'status: OK'],
    ])
  })
})
