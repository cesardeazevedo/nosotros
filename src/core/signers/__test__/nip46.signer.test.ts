import { Kind } from '@/constants/kinds'
import { RELAY_1 } from '@/constants/testRelays'
import { fakeEvent } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { bytesToHex } from '@noble/hashes/utils'
import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { takeUntil, timer } from 'rxjs'
import { NIP01Signer } from '../nip01.signer'
import { NIP46RemoteSigner } from '../nip46.signer'
import { pool } from '@/nostr/pool'

const testSecret = generateSecretKey()
const testSecretHex = bytesToHex(testSecret)
const testPubkey = getPublicKey(testSecret)
const testSigner = new NIP01Signer(testSecretHex)

const createEncryptedEvent = async (pubkey: string, message: unknown) => {
  const encrypted = await testSigner.encrypt(pubkey, JSON.stringify(message))
  return fakeEvent({ kind: Kind.NostrConnect, content: encrypted, pubkey, tags: [['p', testPubkey]] })
}

describe.skip('NIP46Signer', () => {
  test('assert bunkerUrl parsed', async () => {
    const signer = new NIP46RemoteSigner(pool, {
      // auth: () => EMPTY,
      method: {
        method: 'bunkerurl',
        bunkerUrl: `bunker://c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e?relay=${RELAY_1}&secret=123`,
      },
    })
    const spy = subscribeSpyTo(signer.bunker$)
    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      {
        pubkey: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
        relay: RELAY_1,
        secret: '123',
      },
    ])
  })

  test('assert nostrconnect parsed', async ({ createMockRelay }) => {
    const pubkey = 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e'
    const event1 = await createEncryptedEvent(pubkey, { id: '1', result: 'ok' })
    const event2 = await createEncryptedEvent(pubkey, { id: '2', result: pubkey })
    const relay = createMockRelay(RELAY_1, [event1, event2])
    const signer = new NIP46RemoteSigner(pool, {
      // auth: () => EMPTY,
      secret: '123',
      clientSecret: testSecretHex,
      method: {
        method: 'nostrconnect',
        relay: RELAY_1,
      },
    })
    expect(signer.getNostrconnect()).toBe(
      `nostrconnect://${testPubkey}?secret=123&name=nosotros.app&description=A+decentralized+social+network+based+on+nostr+protocol&url=https%3A%2F%2Fnosotros.app&image=https%3A%2F%2Fnosotros.app%2Fapple-touch-icon-180x180.png&relay=wss%3A%2F%2F127.0.0.1%3A8001`,
    )
    const spy = subscribeSpyTo(signer.events$.pipe(takeUntil(timer(1000))))
    await spy.onComplete()
    expect(spy.getValues()).toStrictEqual([
      [
        {
          relay: RELAY_1,
          // pubkey: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
        },
        event1,
        { id: '1', result: 'ok' },
      ],
      [
        {
          relay: RELAY_1,
          // pubkey: 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
        },
        event2,
        { id: '2', result: pubkey },
      ],
    ])
    expect(relay.received).toStrictEqual([
      ['REQ', '1', { '#p': [signer.clientSigner.pubkey], kinds: [Kind.NostrConnect] }],
    ])

    // const pubkeySpy = subscribeSpyTo(from(signer.getPublicKey()).pipe(takeUntil(timer(5000))))
    //
    // relaySendEvents(relay, '2', [event2])
    // await pubkeySpy.onComplete()
    // console.log('?', pubkeySpy.getValues())
  })
})
