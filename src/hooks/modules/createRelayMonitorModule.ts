import { Kind } from '@/constants/kinds'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type RelayMonitorModule = FeedModule & {}

export function createRelayMonitorModule(): RelayMonitorModule {
  const id = 'relaydiscovery'
  const filter = {
    kinds: [Kind.RelayMonitor],
    limit: 500,
  }
  return {
    id,
    filter,
    scope: 'self',
    queryKey: queryKeys.feed(id, filter),
    type: 'relaydiscovery',
    live: false,
    pageSize: 50,
    ctx: {
      relays: ['wss://monitorlizard.nostr1.com'],
      network: 'REMOTE_ONLY',
      negentropy: false,
      outbox: false,
    },
  }
}
