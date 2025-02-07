import type { NostrEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, mergeWith, pipe } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { insertDB } from './insertDB'
import { insertLocalRelay } from './insertLocalRelay'

export function insert(client: NostrClient, options?: ClientSubOptions): OperatorFunction<NostrEvent, NostrEvent> {
  const localRelays = Array.from(client.localSets)
  if (options?.queryLocal !== false) {
    return pipe(
      client.settings.localDB ? insertDB() : mergeWith(EMPTY),
      localRelays.length > 0 ? insertLocalRelay(client.pool, localRelays) : mergeWith(EMPTY),
    )
  }
  return mergeWith(EMPTY)
}
