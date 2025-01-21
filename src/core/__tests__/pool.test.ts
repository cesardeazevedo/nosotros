import { RELAY_1, RELAY_2 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { Pool } from 'core/pool'

describe('Pool', () => {
  test('assert relay disconnect', async ({ relay }) => {
    const pool = new Pool()
    const relay1 = pool.get(RELAY_1)!
    pool.get(RELAY_2)!

    expect(pool.relays.size).toBe(2)
    expect(pool.relays.get(RELAY_1)).toStrictEqual(relay1)

    await relay.connected

    relay.close()

    expect(pool.relays.size).toBe(1)
  })

  test('assert relay error', ({ relay }) => {
    const pool = new Pool()
    const relay1 = pool.get(RELAY_1)!
    pool.get(RELAY_2)

    expect(pool.relays.size).toBe(2)
    expect(pool.relays.get(RELAY_1)).toStrictEqual(relay1)
    expect(pool.blacklisted.has(RELAY_1)).toBe(false)

    relay.error()

    expect(pool.relays.size).toBe(1)
    expect(pool.blacklisted.has(RELAY_1)).toBe(true)
  })
})
