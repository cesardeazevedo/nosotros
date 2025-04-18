import type { NostrEvent } from 'nostr-tools'

export const isEventTag = (tag: string[]) => tag[0] === 'e'
export const isQuoteTag = (tag: string[]) => tag[0] === 'q'
export const isAuthorTag = (tag: string[]) => tag[0] === 'p' || tag[0] === 'P'
export const isMention = (tag: string[]) => tag[3] === 'mention'

export type ParsedTags = {
  [key: string]: string[][] | undefined
}

export function parseTags(tags: NostrEvent['tags']): ParsedTags {
  return tags.reduce((acc, tag) => {
    const key = tag[0]
    acc[key] ??= []
    acc[key]?.push(tag)
    return acc
  }, {} as ParsedTags)
}
