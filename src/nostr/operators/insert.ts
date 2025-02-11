import type { NostrEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, mergeWith, pipe } from 'rxjs'
import type { NostrContext } from '../context'
import { pool } from '../pool'
import { insertDB } from './insertDB'
import { insertLocalRelay } from './insertLocalRelay'

export function insert(ctx: NostrContext): OperatorFunction<NostrEvent, NostrEvent> {
  const localRelays = Array.from(ctx.localSets)
  if (ctx.subOptions?.queryLocal !== false) {
    return pipe(
      ctx.settings.localDB ? insertDB() : mergeWith(EMPTY),
      localRelays.length > 0 ? insertLocalRelay(pool, localRelays) : mergeWith(EMPTY),
    )
  }
  return mergeWith(EMPTY)
}
