import type { UserRelay } from '../parseRelayList'
import { READ, WRITE } from '../parseRelayList'
import { selectRelays } from '../selectRelays'

describe('selectRelays', () => {
  test('assert relay selection', () => {
    const data: UserRelay[] = [
      { pubkey: '1', relay: 'wss://relay1.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay2.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay3.com', permission: READ },
      { pubkey: '1', relay: 'wss://relay4.com', permission: READ },
      { pubkey: '1', relay: 'wss://relay5.com', permission: WRITE },
      { pubkey: '1', relay: 'wss://relay6.com', permission: WRITE },
    ]
    expect(selectRelays(data, { maxRelaysPerUser: 1 })).toStrictEqual([
      { pubkey: '1', relay: 'wss://relay1.com', permission: READ | WRITE },
    ])
    expect(selectRelays(data, { maxRelaysPerUser: 2 })).toStrictEqual([
      { pubkey: '1', relay: 'wss://relay1.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay2.com', permission: READ | WRITE },
    ])
    expect(selectRelays(data, { maxRelaysPerUser: 8, permission: WRITE })).toStrictEqual([
      { pubkey: '1', relay: 'wss://relay1.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay2.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay5.com', permission: WRITE },
      { pubkey: '1', relay: 'wss://relay6.com', permission: WRITE },
    ])
    expect(selectRelays(data, { permission: READ })).toStrictEqual([
      { pubkey: '1', relay: 'wss://relay1.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay2.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay3.com', permission: READ },
      { pubkey: '1', relay: 'wss://relay4.com', permission: READ },
    ])
  })
})
