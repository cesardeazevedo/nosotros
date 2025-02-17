import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '../context'
import { ShareReplayCache } from '../replay'
import type { NostrEventZapReceipt } from '../types'
import { subscribeZaps } from './subscribeZaps'

const replay = new ShareReplayCache<NostrEventZapReceipt>()

export const subscribeZapsFromId = replay.wrap((_id: string, filter: NostrFilter, ctx: NostrContext) => {
  return subscribeZaps(filter, ctx)
})
