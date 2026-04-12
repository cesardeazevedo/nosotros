import { Kind } from '@/constants/kinds'
import { EMBEDDINGS_RELAYS } from '@/constants/relays'
import type { Module } from './module'
import { queryKeys } from '../query/queryKeys'

export function createTrustedListModule(dTag?: string): Module {
  const id = dTag ? `trustedlist_${dTag}` : 'trustedlist'
  const filter = {
    kinds: [Kind.TrustedList],
    ...(dTag ? { '#d': [dTag] } : {}),
    limit: 1,
  }
  const queryKey = dTag ? queryKeys.tag('d', [dTag], Kind.TrustedList) : queryKeys.feed(id, filter)
  return {
    id,
    filter,
    type: 'lists' as const,
    queryKey,
    ctx: {
      relays: EMBEDDINGS_RELAYS,
      network: 'REMOTE_ONLY',
      negentropy: false,
      outbox: false,
    },
  }
}
