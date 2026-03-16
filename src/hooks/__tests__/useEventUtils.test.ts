import { renderHook } from '@testing-library/react'
import { fakeEventMeta } from '@/utils/faker'
import { useImetaList } from '../useEventUtils'

test('assert useImetaList', () => {
  const event = fakeEventMeta({
    id: 'event-1',
    kind: 1,
    pubkey: 'pubkey-1',
    created_at: 100,
    content: 'Lorem ipsum dolor sit amet.\n\nhttps://cdn.example.com/image-1.jpg\n\nhttps://cdn.example.com/image-2.jpg',
    tags: [
      [
        'imeta',
        'url https://cdn.example.com/image-1.jpg',
        'x hash-1',
        'ox original-hash-1',
        'size 1000',
        'm image/jpeg',
        'dim 100x80',
        'blurhash blurhash-1',
      ],
      [
        'imeta',
        'url https://cdn.example.com/image-2.jpg',
        'x hash-2',
        'ox original-hash-2',
        'size 2000',
        'm image/jpeg',
        'dim 200x160',
        'blurhash blurhash-2',
      ],
    ],
    sig: 'sig-1',
  })

  const { result } = renderHook(() => useImetaList(event))

  expect(event.metadata?.imeta).toBeDefined()
  expect(event.metadata?.contentSchema?.content[1]?.type).toBe('mediaGroup')
  expect(result.current).toStrictEqual([
    [
      'image',
      'https://cdn.example.com/image-1.jpg',
      event.metadata?.imeta?.['https://cdn.example.com/image-1.jpg'],
    ],
    [
      'image',
      'https://cdn.example.com/image-2.jpg',
      event.metadata?.imeta?.['https://cdn.example.com/image-2.jpg'],
    ],
  ])
})
