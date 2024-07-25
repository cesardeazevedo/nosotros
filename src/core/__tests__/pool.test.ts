import { Pool } from 'core/pool'
import { RELAY_1, RELAY_2, test } from 'utils/fixtures'

describe('Pool', () => {
  test('assert relay disconnect', async ({ relay }) => {
    const pool = new Pool()
    const relay1 = pool.getOrAddRelay(RELAY_1)!
    pool.getOrAddRelay(RELAY_2)!

    expect(pool.relays.size).toBe(2)
    expect(pool.relays.get(RELAY_1)).toStrictEqual(relay1)

    expect(relay1.connected).toBe(false)
    await relay.connected
    expect(relay1.connected).toBe(true)

    relay.close()

    expect(pool.relays.size).toBe(1)
    expect(relay1.connected).toBe(false)
  })

  test('assert relay error', ({ relay }) => {
    const pool = new Pool()
    const relay1 = pool.getOrAddRelay(RELAY_1)!
    pool.getOrAddRelay(RELAY_2)!

    expect(pool.relays.size).toBe(2)
    expect(pool.relays.get(RELAY_1)).toStrictEqual(relay1)
    expect(pool.blacklisted.has(RELAY_1)).toBe(false)

    relay.error()

    expect(pool.relays.size).toBe(1)
    expect(relay1.connected).toBe(false)
    expect(pool.blacklisted.has(RELAY_1)).toBe(true)
  })
})
