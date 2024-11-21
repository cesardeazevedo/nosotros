import type { RelayHints } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'

const QUOTE = 'q'
const EVENT = 'e'
const PUBKEY = 'p'
const MENTION = 'mention'

export const isEventTag = (tag: string[]) => tag[0] === EVENT
export const isQuoteTag = (tag: string[]) => tag[0] === QUOTE
export const isAuthorTag = (tag: string[]) => tag[0] === PUBKEY
export const isMention = (tag: string[]) => tag[3] === MENTION

export type ParsedTags = {
  [key: string]: string[][]
} & {
  hints?: RelayHints
}

function appendHint(hints: RelayHints, field: keyof RelayHints, key: string, value: string) {
  hints[field] ??= {}
  hints[field][key] ??= []
  if (hints[field][key].indexOf(value) === -1) {
    hints[field][key].push(value)
  }
}

export function parseTags(tags: NostrEvent['tags']): ParsedTags {
  return tags.reduce((acc, tag) => {
    const key = tag[0]
    acc[key] ??= []
    acc[key]?.push(tag)

    // parse relay hints from e, p,and q tags
    if (isAuthorTag(tag) || isEventTag(tag) || isQuoteTag(tag)) {
      const [, value, relay, , pubkey] = tag
      acc.hints ??= {}
      if (relay) {
        if (isAuthorTag(tag)) {
          appendHint(acc.hints, 'authors', value, relay)
        } else {
          appendHint(acc.hints, 'ids', value, relay)
        }
      }
      // Include pubkey hint
      if (pubkey) {
        appendHint(acc.hints, 'fallback', value, pubkey)
      }
    }
    return acc
  }, {} as ParsedTags)
}
