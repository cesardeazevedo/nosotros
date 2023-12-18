// @vitest-environment jsdom
import { FIXED_RELAYS } from 'constants/relays'
import { Pool } from '../pool'

describe('Pool', () => {
  test('should initialize with fixed relays', () => {
    const pool = new Pool()
    const relay1 = 'wss://relay1.com'
    expect(pool.urls).toStrictEqual(FIXED_RELAYS)
    pool.initialize([relay1])
    expect(pool.urls).toStrictEqual([...FIXED_RELAYS, relay1])
    expect(Array.from(pool.relays.keys())).toStrictEqual([...FIXED_RELAYS, relay1])
  })
})
