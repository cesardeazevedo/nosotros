import { READ, WRITE } from '@/nostr/nips/nip65.relaylist'
import { fakeNote } from '@/utils/faker'
import { parseRelayList } from '../parseRelayList'

test('parseRelayList()', () => {
  const event = fakeNote({
    id: '1',
    kind: 10002,
    pubkey: '1',
    tags: [
      ['r', 'wss://relay1.com'],
      ['r', 'wss://relay2.com'],
      ['r', 'wss://relay3.com'],
      ['r', 'wss://relay4.com', 'read'],
      ['r', 'wss://relay5.com', 'read'],
      ['r', 'wss://relay6.com', 'write'],
      ['r', 'wss://relay7.com', 'write'],
      // assert duplicated
      ['r', 'wss://relay1.com'],
      ['r', 'wss://relay2.com', 'read'],
      ['r', 'wss://relay3.com', 'write'],
      ['r', 'wss://relay4.com', 'write'],
      ['r', 'wss://relay6.com', 'write'],
    ],
  })
  const result = parseRelayList(event)
  expect(result).toStrictEqual([
    { pubkey: '1', relay: 'wss://relay1.com', permission: READ | WRITE },
    { pubkey: '1', relay: 'wss://relay2.com', permission: READ | WRITE },
    { pubkey: '1', relay: 'wss://relay3.com', permission: READ | WRITE },
    { pubkey: '1', relay: 'wss://relay4.com', permission: READ | WRITE },
    { pubkey: '1', relay: 'wss://relay5.com', permission: READ },
    { pubkey: '1', relay: 'wss://relay6.com', permission: WRITE },
    { pubkey: '1', relay: 'wss://relay7.com', permission: WRITE },
  ])
})
