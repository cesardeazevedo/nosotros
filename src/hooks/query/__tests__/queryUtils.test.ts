import { Kind } from '@/constants/kinds'
import { fakeEvent, fakeEventMeta } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { queryClient } from '../queryClient'
import { appendEventFeed, prependEventFeed } from '../queryUtils'
import type { InfiniteEvents } from '../useQueryFeeds'

test('assert prependEventFeed', () => {
  const queryKey = ['feed']
  const existingData = {
    pageParams: [],
    pages: [
      [
        fakeEvent({ id: '1', kind: Kind.Text, content: 'note1' }),
        fakeEvent({ id: '2', kind: Kind.Text, content: 'note2' }),
      ],
      [fakeEvent({ id: '3', kind: Kind.Text, content: 'note3' })],
    ],
  }
  queryClient.setQueryData(queryKey, existingData)

  prependEventFeed(queryKey, [
    fakeEventMeta({ id: '4', kind: Kind.Text, content: 'note4' }),
    fakeEventMeta({ id: '1', kind: Kind.Text, content: 'note3' }),
  ])

  const result = queryClient.getQueryData(queryKey) as InfiniteEvents

  expect(result.pages[0]).toHaveLength(3)
  expect(result.pages[1]).toHaveLength(1)
})

test('assert appendEvents', () => {
  const queryKey = ['feed']
  const existingData = {
    pageParams: [],
    pages: [
      [
        fakeEvent({ id: '1', kind: Kind.Text, content: 'note1' }),
        fakeEvent({ id: '2', kind: Kind.Text, content: 'note2' }),
      ],
      [
        fakeEvent({ id: '3', kind: Kind.Text, content: 'note3' }),
        // check duplicated
        fakeEvent({ id: '4', kind: Kind.Text, content: 'note4' }),
      ],
    ],
  }
  queryClient.setQueryData(queryKey, existingData)

  const newEvent = fakeEventMeta({ id: '4', kind: Kind.Text, content: 'note4' })
  appendEventFeed(queryKey, [newEvent])

  const result = queryClient.getQueryData(queryKey) as InfiniteEvents

  expect(result.pages[0]).toHaveLength(2)
  expect(result.pages[1]).toHaveLength(2)
  expect(result.pages[1][1]).toStrictEqual(newEvent)
})
