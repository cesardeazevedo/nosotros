import type { NostrEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, mergeWith, pipe } from 'rxjs'
import type { NostrContext } from '../context'
import { pool } from '../pool'
import { insertDB } from './insertDB'
import { insertLocalRelay } from './insertLocalRelay'

export function insert(ctx: NostrContext): OperatorFunction<NostrEvent, NostrEvent> {
  return pipe(
    ctx.insertDB !== false ? insertDB() : mergeWith(EMPTY),
    ctx.relaysLocal?.length !== 0 ? insertLocalRelay(pool, ctx.relaysLocal || []) : mergeWith(EMPTY),
  )
}
