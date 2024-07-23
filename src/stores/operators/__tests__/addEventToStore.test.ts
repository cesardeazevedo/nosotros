import { fakeNote } from 'utils/faker'
import { addEventToStore } from '../addEventToStore'
import { hasEventInStore } from '../hasEventInStore'

test('addEventToStore()', () => {
  const event = fakeNote({ id: '1', kind: 0 })
  expect(hasEventInStore(event)).toBe(false)
  addEventToStore(event)
  expect(hasEventInStore(event)).toBe(true)

  const event2 = fakeNote({ id: '2', kind: 10002, pubkey: '1' })
  expect(hasEventInStore(event2)).toBe(false)
  addEventToStore(event2)
  expect(hasEventInStore(event2)).toBe(true)
})
