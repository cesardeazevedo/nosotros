import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import type { QueryKey } from '@tanstack/react-query'
import type { FeedModule } from '../query/useQueryFeeds'
import type { EventModule } from './createEventModule'
import type { MediaFeedModule } from './createMediaFeedModule'
import type { NotificationFeedModule } from './createNotificationFeedModule'

export type ModuleType =
  | 'home'
  | 'feed'
  | 'media'
  | 'quotes'
  | 'reposts'
  | 'profile'
  | 'search'
  | 'tags'
  | 'articles'
  | 'relaysets'
  | 'relayfeed'
  | 'bookmarks'
  | 'relayfavorites'
  | 'relaydiscovery'
  | 'followset'
  | 'starterpack'
  | 'lists'
  | 'inbox'
  | 'event'

export type Module = {
  id: string
  type: ModuleType
  filter: NostrFilter
  queryKey: QueryKey
  ctx: NostrContext
}

export type Modules = FeedModule | NotificationFeedModule | MediaFeedModule | EventModule
