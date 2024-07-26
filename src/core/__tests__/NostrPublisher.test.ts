import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { Kind } from 'constants/kinds'
import { NostrPublisher } from 'core/NostrPublish'
import type { Signer } from 'core/signers/signer'
import type { NostrEvent, UnsignedEvent } from 'nostr-tools'
import { finalizeEvent, generateSecretKey } from 'nostr-tools'
import { of } from 'rxjs'
import { RELAY_1 } from 'utils/fixtures'

class TestSigner implements Signer {
  async sign(event: UnsignedEvent): Promise<NostrEvent> {
    return finalizeEvent({ ...event }, generateSecretKey()) as NostrEvent
  }
}

describe('NostrPublish', () => {
  test('Test NostrPublish', async () => {
    const event = {
      kind: Kind.Text,
      content: '',
      created_at: Date.now(),
      pubkey: '',
      tags: [],
    } as UnsignedEvent

    const publisher = new NostrPublisher(event, {
      signer: new TestSigner(),
      relays: of([RELAY_1]),
    })

    const spy = subscribeSpyTo(publisher.relayEvent)

    await spy.onComplete()

    const values = spy.getValues()
    expect(values).toHaveLength(1)
    expect(values[0]).toHaveLength(2)
    expect(values[0][0]).toStrictEqual(RELAY_1)
    expect(values[0][1].kind).toStrictEqual(Kind.Text)
  })
})
