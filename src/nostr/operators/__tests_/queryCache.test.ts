import { subscribeSpyTo } from "@hirez_io/observer-spy"
import { Kind } from "constants/kinds"
import { parseNote } from "nostr/nips/nip01/metadata/parseNote"
import { storage } from "nostr/storage"
import { fakeNote } from "utils/faker"
import { queryCache } from "../queryCache"

test('queryCache()', async () => {
  const note1 = parseNote(fakeNote({ id: '1', kind: Kind.Text, pubkey: '1' }))
  const note2 = parseNote(fakeNote({ id: '2', kind: Kind.Text, pubkey: '1' }))
  const note3 = parseNote(fakeNote({ id: '3', kind: Kind.Text, pubkey: '2' }))
  await storage.insert(note1)
  await storage.insert(note2)
  await storage.insert(note3)

  const $ = queryCache([{ kinds: [Kind.Text], authors: ['1'] }])

  const spy = subscribeSpyTo($)
  await spy.onComplete()

  expect(spy.getValues()).toStrictEqual([note1, note2])
})
