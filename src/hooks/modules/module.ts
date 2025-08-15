import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import type { QueryKey } from '@tanstack/react-query'

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
