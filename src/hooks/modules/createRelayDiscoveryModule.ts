import { Kind } from '@/constants/kinds'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type RelayDiscoveryModule = FeedModule & {}

export function createRelayDiscoveryModule(): RelayDiscoveryModule {
  const id = 'relaydiscovery'
  const filter = {
    kinds: [Kind.RelayDiscovery],
    limit: 50,
  }
  return {
    id,
    filter,
    scope: 'self',
    queryKey: queryKeys.feed(id, filter),
    type: 'relaydiscovery',
    live: false,
    ctx: {
      relays: ['wss://monitorlizard.nostr1.com'],
      network: 'REMOTE_ONLY',
      negentropy: false,
      outbox: false,
    },
  }
}
