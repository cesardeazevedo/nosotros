import { pruneFilters } from '@/nostr/prune'
import { test } from '@/utils/fixtures'
import { Kind } from 'constants/kinds'
import { setCache } from '../cache'
import { fakeNote } from '@/utils/faker'

describe('pruneFilters()', () => {
  test('assert multiple filters', () => {
    setCache(fakeNote({ kind: Kind.Text, id: '1' }), true)
    setCache(fakeNote({ kind: Kind.Text, id: '2' }), true)

    setCache(fakeNote({ kind: Kind.Metadata, id: '3', pubkey: '1' }), true)
    setCache(fakeNote({ kind: Kind.Metadata, id: '4', pubkey: '2' }), true)

    setCache(fakeNote({ kind: Kind.Follows, id: '5', pubkey: '1', tags: [['p', '0']] }), true)
    setCache(fakeNote({ kind: Kind.Follows, id: '6', pubkey: '2', tags: [['p', '0']] }), true)

    setCache(fakeNote({ kind: Kind.RelayList, id: '7', pubkey: '1', tags: [['r', '']] }), true)
    setCache(fakeNote({ kind: Kind.RelayList, id: '8', pubkey: '2', tags: [['r', '']] }), true)

    expect(
      pruneFilters([
        { kinds: [Kind.Metadata], authors: ['1', '2', '3'] },
        { kinds: [Kind.Text], authors: ['1', '2'] },
        { kinds: [Kind.Follows], authors: ['1', '2', '3'] },
        { kinds: [Kind.RelayList], authors: ['1', '2', '3'] },
        { ids: ['1', '2', '3', '10'] },
      ]),
    ).toStrictEqual([
      { kinds: [Kind.Metadata], authors: ['3'] },
      { kinds: [Kind.Text], authors: ['1', '2'] },
      { kinds: [Kind.Follows], authors: ['3'] },
      { kinds: [Kind.RelayList], authors: ['3'] },
      { ids: ['10'] },
    ])
  })
})
