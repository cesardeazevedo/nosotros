import type { NostrEvent } from 'core/types'

export class Follows {
  id: string
  pubkey: string
  created_at: number
  authors = new Set<string>()
  tags = new Set<string>() // todo

  constructor(data: NostrEvent) {
    this.id = data.id
    this.pubkey = data.pubkey
    this.created_at = data.created_at

    this.authors = new Set(
      data.tags
        .filter((tag) => tag[0] === 'p' && (tag[1].length === 64 || import.meta.env.MODE === 'test'))
        .map((tag) => tag[1]),
    )
  }

  followsPubkey(pubkey?: string) {
    return this.authors.has(pubkey || '')
  }
}
