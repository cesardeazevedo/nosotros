import type { NostrEvent } from 'nostr-tools'
import { Negentropy, NegentropyStorageVector } from './Negentropy'

export function getNegentropy(events: Map<string, NostrEvent>) {
  const storage = new NegentropyStorageVector()
  const negentropy = new Negentropy(storage)

  Array.from(events.values())
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
    .forEach((event) => storage.insert(event.created_at, event.id))

  storage.seal()
  return negentropy
}
