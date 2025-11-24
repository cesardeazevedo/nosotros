import type { NostrEventExists } from '@/db/sqlite/sqlite.types'
import { Negentropy, NegentropyStorageVector } from './Negentropy'

export function getNegentropy(events: NostrEventExists[]) {
  const storage = new NegentropyStorageVector()
  const negentropy = new Negentropy(storage)

  Array.from(events.values())
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
    .forEach((event) => storage.insert(event.created_at, event.id))

  storage.seal()
  return negentropy
}
