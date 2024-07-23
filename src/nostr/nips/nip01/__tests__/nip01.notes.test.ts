import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { Kind } from 'constants/kinds'
import { Pool } from 'core/pool'
import { NostrClient } from 'nostr/nostr'
import { fakeNote } from 'utils/faker'
import { RELAY_1, test } from 'utils/fixtures'
import { expectRelayReceived, relaySendEose, relaySendEvents } from 'utils/testHelpers'
import { parseNote } from '../metadata/parseNote'
import { NIP01Notes } from '../nip01.notes'

describe('NIP01Notes', () => {
  test('Assert subWithRelated notes', async ({ relay }) => {
    const pool = new Pool()
    const client = new NostrClient(pool, {
      relays: [RELAY_1],
    })

    const nip01 = new NIP01Notes(client)
    const filter = { authors: ['1'] }
    const $ = nip01.subWithRelated(filter)

    const spy = subscribeSpyTo($)

    const reqId = await expectRelayReceived(relay, { kinds: [Kind.Text, Kind.Article], ...filter })

    const event1 = fakeNote({ pubkey: '1' })

    relaySendEvents(relay, reqId, [event1])

    // Assert user requests
    const reqId2 = await expectRelayReceived(relay, { kinds: [Kind.Metadata, Kind.RelayList], ...filter })

    relaySendEose(relay, reqId)
    relaySendEose(relay, reqId2)

    // Stream complete after eose
    await spy.onComplete()

    expect(spy.getValues()).toStrictEqual([parseNote(event1)])
  }, { timeout: 10000 })
})
