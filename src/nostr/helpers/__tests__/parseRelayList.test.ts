import { fakeEvent } from '@/utils/faker'
import { parseRelayListToTags, parseRelayList, READ, WRITE, addPermission, revokePermission } from '../parseRelayList'

test('parseRelayList()', () => {
  const event = fakeEvent({
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
  expect(result).toStrictEqual({
    id: '1',
    kind: 10002,
    relayList: [
      { pubkey: '1', relay: 'wss://relay1.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay2.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay3.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay4.com', permission: READ | WRITE },
      { pubkey: '1', relay: 'wss://relay5.com', permission: READ },
      { pubkey: '1', relay: 'wss://relay6.com', permission: WRITE },
      { pubkey: '1', relay: 'wss://relay7.com', permission: WRITE },
    ],
  })
  expect(parseRelayListToTags(result.relayList)).toStrictEqual([
    ['r', 'wss://relay1.com'],
    ['r', 'wss://relay2.com'],
    ['r', 'wss://relay3.com'],
    ['r', 'wss://relay4.com'],
    ['r', 'wss://relay5.com', 'read'],
    ['r', 'wss://relay6.com', 'write'],
    ['r', 'wss://relay7.com', 'write'],
  ])
})

test('addPermission() revokePermission()', () => {
  const event = fakeEvent({
    id: '1',
    kind: 10002,
    pubkey: '1',
    tags: [
      ['r', 'wss://relay1.com'],
      ['r', 'wss://relay2.com'],
      ['r', 'wss://relay3.com', 'read'],
      ['r', 'wss://relay4.com', 'read'],
      ['r', 'wss://relay5.com', 'write'],
      ['r', 'wss://relay6.com', 'write'],
    ],
  })

  const result = parseRelayList(event).relayList
  // add write permission to relay3
  const result2 = addPermission(result, { relay: 'wss://relay3.com', permission: WRITE, pubkey: '1' })
  // revoke write permission from relay5
  const result3 = revokePermission(result2, { relay: 'wss://relay5.com', permission: WRITE, pubkey: '1' })
  // add read permission from relay7 (new relay)
  const result4 = addPermission(result3, { relay: 'wss://relay7.com', permission: READ, pubkey: '1' })
  // add write permission from relay7 (new relay)
  const result5 = addPermission(result4, { relay: 'wss://relay7.com', permission: WRITE, pubkey: '1' })
  // revoke read permission from relay2
  const result6 = revokePermission(result5, { relay: 'wss://relay2.com', permission: READ, pubkey: '1' })

  expect(parseRelayListToTags(result6)).toStrictEqual([
    ['r', 'wss://relay1.com'],
    ['r', 'wss://relay2.com', 'write'],
    ['r', 'wss://relay3.com'],
    ['r', 'wss://relay4.com', 'read'],
    ['r', 'wss://relay6.com', 'write'],
    ['r', 'wss://relay7.com'],
  ])
})
