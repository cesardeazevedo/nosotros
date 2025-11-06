import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { fakeEvent, fakeEventMeta } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { queryClient } from '../queryClient'
import {
  appendEventFeed,
  appendEventToQuery,
  prependEventFeed,
  removeEventFromFeed,
  removeEventFromQuery,
} from '../queryUtils'
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

test('assert appendEventQuery', () => {
  const queryKey = ['events']
  const existingData = [
    fakeEvent({ id: 'note1', kind: Kind.Text, content: 'note1' }),
    fakeEvent({ id: 'note2', kind: Kind.Text, content: 'note2' }),
  ]

  queryClient.setQueryData(queryKey, existingData)

  const newEvent3 = fakeEventMeta({ id: 'note3', kind: Kind.Text, content: 'note3' })
  const newEvent2 = fakeEventMeta({ id: 'note2', kind: Kind.Text, content: 'note2 updated' })

  appendEventToQuery(queryKey, [newEvent3, newEvent2])

  const result = queryClient.getQueryData(queryKey) as NostrEventDB[]

  expect(result).toHaveLength(3)
  expect(result[0].id).toBe('note1')
  expect(result[1].id).toBe('note2')
  expect(result[2].id).toBe('note3')
})

test('assert removeEventFromFeed', () => {
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

  removeEventFromFeed(queryKey, '2')

  const result = queryClient.getQueryData(queryKey) as InfiniteEvents
  expect(result.pages[0]).toHaveLength(2)
  expect(result.pages[0].find((e) => e.id === '2')).toBeUndefined()
})

test('assert removeEventFromQuery', () => {
  const queryKey = ['events']
  const note1 = fakeEvent({ id: '1', kind: Kind.Text, content: 'note1' })
  const note2 = fakeEvent({
    id: '2',
    kind: Kind.Text,
    content: 'note2',
    tags: [['e', '1', '', 'root']],
  })
  const note3 = fakeEvent({
    id: '3',
    kind: Kind.Text,
    content: 'note3',
    tags: [
      ['e', '1', '', 'root'],
      ['e', '2', '', 'reply'],
    ],
  })
  const note4 = fakeEvent({
    id: '4',
    kind: Kind.Text,
    content: 'note4',
    tags: [
      ['e', '1', '', 'root'],
      ['e', '2', '', 'reply'],
    ],
  })

  queryClient.setQueryData(queryKey, [note1, note2, note3, note4])

  removeEventFromQuery(queryKey, '2')
  removeEventFromQuery(queryKey, '4')

  const result = queryClient.getQueryData(queryKey) as NostrEventDB[]
  expect(result).toHaveLength(2)
  expect(result.find((e) => e.id === '2')).toBeUndefined()
  expect(result.find((e) => e.id === '3')).toBeDefined()
})
