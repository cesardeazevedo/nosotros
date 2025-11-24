import { RELAY_1, RELAY_2 } from '@/constants/testRelays'
import { Pool } from '@/core/pool'
import { NIP01Signer } from '@/core/signers/nip01.signer'
import { RelayToClient } from '@/core/types'
import { test } from '@/utils/fixtures'
import { subscribeSpyTo } from '@hirez_io/observer-spy'
import { map, of, takeUntil, timer } from 'rxjs'
import { createAuthenticator } from '../createAuthenticator'

describe('createAuthenticator', () => {
  test('assert fixed whitelist', async ({ createMockRelay }) => {
    const relay1 = createMockRelay(RELAY_1, [])
    const relay2 = createMockRelay(RELAY_2, [])
    const pool = new Pool()
    const auth$ = createAuthenticator({
      pool,
      auto: false,
      signer: new NIP01Signer(),
      whitelist: of([RELAY_1]),
    })
    const spy = subscribeSpyTo(auth$.pipe(takeUntil(timer(500))))
    pool.get(RELAY_1)
    pool.get(RELAY_2)
    relay1.send(JSON.stringify([RelayToClient.AUTH, 'relay_1_challange']))
    relay2.send(JSON.stringify([RelayToClient.AUTH, 'relay_2_challange']))

    await spy.onComplete()
    await relay1.close()
    await relay2.close()
    expect(relay1.received).toStrictEqual([['AUTH', expect.any(Object)]])
    expect(relay2.received).toStrictEqual([])
  })

  test('assert whitelist after auth', async ({ createMockRelay }) => {
    const relay1 = createMockRelay(RELAY_1, [])
    const relay2 = createMockRelay(RELAY_2, [])
    const pool = new Pool()
    const auth$ = createAuthenticator({
      pool,
      auto: false,
      signer: new NIP01Signer(),
      // user allowed authentication on RELAY_1 after 1 seconds
      whitelist: timer(1000).pipe(map(() => [RELAY_1])),
    })
    const spy = subscribeSpyTo(auth$.pipe(takeUntil(timer(2000))))
    pool.get(RELAY_1)
    pool.get(RELAY_2)
    relay1.send(JSON.stringify([RelayToClient.AUTH, 'relay_1_challange']))
    relay2.send(JSON.stringify([RelayToClient.AUTH, 'relay_2_challange']))

    await spy.onComplete()
    await relay1.close()
    await relay2.close()
  })
})
