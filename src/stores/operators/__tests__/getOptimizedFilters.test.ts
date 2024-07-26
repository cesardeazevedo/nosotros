import { Kind } from 'constants/kinds'
import { Pool } from 'core/pool'
import { cacheRelayList } from 'nostr/cache'
import { parseNote } from 'nostr/nips/nip01/metadata/parseNote'
import { parseUser } from 'nostr/nips/nip01/metadata/parseUser'
import { NostrClient } from 'nostr/nostr'
import Follows from 'stores/models/follow'
import Note from 'stores/models/note'
import { followsStore } from 'stores/nostr/follows.store'
import { noteStore } from 'stores/nostr/notes.store'
import { userStore } from 'stores/nostr/users.store'
import { fakeNote, fakeUser } from 'utils/faker'
import { getOptimizedFilters } from '../getOptimizedFilters'

test('filterWithoutCached', () => {
  userStore.add(parseUser(fakeUser('1', { name: 'test' })))
  userStore.add(parseUser(fakeUser('2', { name: 'test' })))

  followsStore.add(new Follows(fakeNote({ kind: Kind.Follows, pubkey: '1', tags: [['p', '0']] })))
  followsStore.add(new Follows(fakeNote({ kind: Kind.Follows, pubkey: '2', tags: [['p', '0']] })))

  cacheRelayList.set('1', true)
  cacheRelayList.set('2', true)

  const pool = new Pool()
  const client = new NostrClient(pool)
  noteStore.add(new Note(parseNote(fakeNote({ id: '1' })), client))
  noteStore.add(new Note(parseNote(fakeNote({ id: '2' })), client))

  expect(
    getOptimizedFilters([
      { kinds: [Kind.Metadata], authors: ['1', '2', '3'] },
      { kinds: [Kind.Text], authors: ['1', '2'] },
      { kinds: [Kind.Follows], authors: ['1', '2', '3'] },
      { kinds: [Kind.RelayList], authors: ['1', '2', '3'] },
      { ids: ['1', '2', '3'] },
    ]),
  ).toStrictEqual([
    { kinds: [Kind.Metadata], authors: ['3'] },
    { kinds: [Kind.Text], authors: ['1', '2'] },
    { kinds: [Kind.Follows], authors: ['3'] },
    { kinds: [Kind.RelayList], authors: ['3'] },
    { ids: ['3'] },
  ])
})
