import type { RelayStatsDB } from '@/db/types'
import type { UserRelay } from '../parseRelayList'
import { READ, WRITE } from '../parseRelayList'
import { selectRelays } from '../selectRelays'

const STAT = {
  connects: 0,
  closes: 0,
  events: 0,
  eoses: 0,
  notices: [],
  auths: 0,
  errors: 0,
  errorMessages: [],
  subscriptions: 0,
  publishes: 0,
  lastAuth: 0,
  lastConnected: 0,
  url: '',
} as RelayStatsDB

describe('selectRelays', () => {
  const data: UserRelay[] = [
    { pubkey: '1', relay: 'wss://relay1.com', permission: READ | WRITE },
    { pubkey: '1', relay: 'wss://relay2.com', permission: READ | WRITE },
    { pubkey: '1', relay: 'wss://relay3.com', permission: READ },
    { pubkey: '1', relay: 'wss://relay4.com', permission: READ },
    { pubkey: '1', relay: 'wss://relay5.com', permission: WRITE },
    { pubkey: '1', relay: 'wss://relay6.com', permission: WRITE },
    { pubkey: '1', relay: 'ws://relay7.com', permission: READ | WRITE },
  ]
  test('assert relay selection', () => {
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
    expect(selectRelays(data, { permission: READ, maxRelaysPerUser: 4 })).toStrictEqual([
      { pubkey: '1', relay: 'wss://relay1.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay2.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay3.com', permission: READ },
      { pubkey: '1', relay: 'wss://relay4.com', permission: READ },
    ])
  })

  test('assert relays that are has more events', () => {
    const stats = {
      'wss://relay1.com': { ...STAT, events: 0 },
      'wss://relay2.com': { ...STAT, events: 1 },
      'wss://relay3.com': { ...STAT, events: 2 },
      'wss://relay4.com': { ...STAT, events: 3 },
    } as Record<string, RelayStatsDB>
    expect(selectRelays(data, { permission: READ, maxRelaysPerUser: 3 }, stats)).toStrictEqual([
      { pubkey: '1', relay: 'wss://relay4.com', permission: READ },
      { pubkey: '1', relay: 'wss://relay3.com', permission: READ },
      { pubkey: '1', relay: 'wss://relay2.com', permission: READ | WRITE },
    ])
  })
})
