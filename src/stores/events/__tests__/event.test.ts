import { fakeEventMeta } from '@/utils/faker'
import { Event } from '../event'

describe('Event', () => {
  test('assert getTag', () => {
    const event = new Event(
      fakeEventMeta({
        tags: [
          ['e', '1'],
          ['e', '2'],
        ],
      }),
    )
    expect(event.getTag('p')).toStrictEqual(undefined)
    expect(event.getTags('p')).toStrictEqual([])
    expect(event.getTag('e')).toStrictEqual('1')
    expect(event.getTags('e')).toStrictEqual(['1', '2'])
  })
})
