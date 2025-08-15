import { Kind } from '@/constants/kinds'
import { decodeNIP19, decodeToFilter } from '@/utils/nip19'
import type { NProfile } from 'nostr-tools/nip19'
import invariant from 'tiny-invariant'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type ProfileModule = FeedModule & {
  nip19: NProfile | string | undefined
}

export function createProfileModule(
  options: Partial<Pick<ProfileModule, 'nip19' | 'filter' | 'includeReplies'>>,
): FeedModule {
  invariant(options.nip19, 'nip19 required')
  const decoded = decodeNIP19(options.nip19)
  const filter = {
    ...decodeToFilter(decoded),
    kinds: options.filter?.kinds || [Kind.Text, Kind.Repost],
    limit: 100,
  }
  return {
    id: options.nip19,
    type: 'profile',
    queryKey: queryKeys.feed(options.nip19, filter),
    filter,
    includeReplies: options.includeReplies,
    ctx: {},
    scope: 'self',
  }
}
