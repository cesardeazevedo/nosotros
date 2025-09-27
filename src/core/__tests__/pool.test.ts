import { RELAY_1, RELAY_2 } from '@/constants/testRelays'
import { test } from '@/utils/fixtures'
import { Pool } from 'core/pool'

describe('Pool', () => {
  test('assert relay disconnect', async ({ createMockRelay }) => {
    const pool = new Pool()
    const relay1 = createMockRelay(RELAY_1, [])
    const relay2 = createMockRelay(RELAY_2, [])

    pool.get(RELAY_1)
    pool.get(RELAY_2)

    expect(pool.relays.size).toBe(2)

    await relay1.close()
    expect(pool.relays.size).toBe(1)
    await relay2.close()
    expect(pool.relays.size).toBe(0)
  })

  test('assert relay error', ({ createMockRelay }) => {
    const pool = new Pool()
    const relay1 = createMockRelay(RELAY_1, [])
    const relay2 = createMockRelay(RELAY_2, [])
    pool.get(RELAY_1)
    pool.get(RELAY_2)

    expect(pool.relays.size).toBe(2)
    expect(pool.blacklisted.has(RELAY_1)).toBe(false)

    relay1.error()

    expect(pool.relays.size).toBe(1)

    relay2.error()
    expect(pool.relays.size).toBe(0)
  })
})
