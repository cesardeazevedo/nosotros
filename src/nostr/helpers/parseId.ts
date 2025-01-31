import type { NostrFilter } from '@/core/types'

export function parseId(id: string): NostrFilter {
  if (id.includes(':')) {
    const [kind, pubkey, identifier] = id.split(':')
    return { kinds: [parseInt(kind)], authors: [pubkey], '#d': [identifier] }
  } else {
    return { ids: [id] }
  }
}
