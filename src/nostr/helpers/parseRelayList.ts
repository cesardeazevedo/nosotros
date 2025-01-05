import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { NostrEvent } from 'nostr-tools'
import { PERMISSIONS, READ, WRITE, type UserRelayDB } from '../nips/nip65.relaylist'

export function parseRelayList(event: NostrEvent) {
  const { tags, pubkey } = event
  const grouped = tags
    .filter((tag) => tag[0] === 'r')
    .reduce<Record<string, UserRelayDB>>((acc, tag) => {
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
  return Object.values(grouped)
}
