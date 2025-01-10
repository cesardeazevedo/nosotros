import type { Kind } from '@/constants/kinds'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { MetadataDB } from '@/db/types'
import type { NostrEvent } from 'nostr-tools'

export type UserRelay = {
  pubkey: string
  relay: string
  permission: number
}

export type UserRelayList = {
  relayList: UserRelay[]
}

export type UserRelayListMetadata = MetadataDB &
  UserRelayList & {
    kind: Kind.RelayList
  }

export const READ = 1 << 0
export const WRITE = 1 << 1
export const PERMISSIONS = { READ, WRITE }

export function parseRelayList(event: NostrEvent): UserRelayListMetadata {
  const { tags, pubkey } = event
  const grouped = tags
    .filter((tag) => tag[0] === 'r')
    .reduce<Record<string, UserRelay>>((acc, tag) => {
      const [, url, perm] = tag
      const relay = formatRelayUrl(url)
      const prev = acc[relay] || {}
      const name = perm?.toUpperCase() as keyof typeof PERMISSIONS | undefined
      const permission = name ? PERMISSIONS[name] : READ | WRITE
      return {
        ...acc,
        [relay]: {
          ...prev,
          pubkey,
          relay,
          permission: prev.permission | permission,
        },
      }
    }, {})

  const relayList = Object.values(grouped)

  return {
    id: event.id,
    kind: event.kind,
    relayList,
  }
}
