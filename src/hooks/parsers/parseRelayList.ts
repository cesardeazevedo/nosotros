import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { NostrEvent } from 'nostr-tools'
import type { Metadata } from '../../nostr/types'

export type UserRelay = {
  pubkey: string
  relay: string
  permission: number
}

export const READ = 1 << 0
export const WRITE = 1 << 1
export const PERMISSIONS = { READ, WRITE }

export function parseRelayList(event: Pick<NostrEvent, 'pubkey' | 'tags'>): Metadata {
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

  return {
    relayList: Object.values(grouped),
  }
}

export function parseRelayListToTags(relayList: UserRelay[]) {
  return relayList.reduce(
    (acc, userRelay) => {
      const tag = ['r', userRelay.relay]
      if (userRelay.permission === (READ | WRITE)) {
        return [...acc, tag]
      }
      return [...acc, [...tag, userRelay.permission === READ ? 'read' : 'write']]
    },
    [] as NostrEvent['tags'],
  )
}

export function addPermission(relayList: UserRelay[], data: UserRelay) {
  return relayList
    .map((relay) => (relay.relay === data.relay ? { ...relay, permission: relay.permission | data.permission } : relay))
    .concat(relayList.some((relay) => relay.relay === data.relay) ? [] : [data])
}

export function revokePermission(relayList: UserRelay[], data: UserRelay) {
  return relayList
    .map((relay) =>
      relay.relay === data.relay ? { ...relay, permission: relay.permission & ~data.permission } : relay,
    )
    .filter((relay) => relay.relay !== data.relay || relay.permission !== 0)
}
