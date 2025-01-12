import type { RelayHints } from '@/core/types'
import type { ParsedTags } from './parseTags'
import { isMention } from './parseTags'

export type RepliesMetadata = {
  isRoot: boolean
  isRootReply: boolean
  isReplyOfAReply: boolean
  rootNoteId: string | undefined
  parentNoteId: string | undefined
  relayHints: RelayHints
}

function appendHint(hints: RelayHints, field: keyof RelayHints, key: string, value: string) {
  if (value) {
    hints[field] ??= {}
    hints[field][key] ??= []
    if (hints[field][key].indexOf(value) === -1) {
      hints[field][key].push(value)
    }
  }
}

function parseRepliesHints(tags: ParsedTags) {
  const hints = {} as RelayHints
  Object.values(tags)
    .flat()
    .forEach((tag) => {
      if (tag) {
        const [name, value, relay] = tag
        switch (name) {
          case 'p': {
            appendHint(hints, 'authors', value, relay)
            break
          }
          case 'q': {
            const pubkey = tag[3]
            appendHint(hints, 'ids', value, relay)
            if (pubkey) {
              appendHint(hints, 'fallback', value, pubkey)
            }
            break
          }
          case 'e': {
            const pubkey = tag[4]
            appendHint(hints, 'ids', value, relay)
            if (pubkey) {
              appendHint(hints, 'fallback', value, pubkey)
            }
            break
          }
        }
      }
    })
  return hints
}

// These are NIP-10 reply marks
export function parseReplies(tags: ParsedTags): RepliesMetadata {
  const relayHints = parseRepliesHints(tags)
  const repliesTags = tags.e?.filter((tag) => !isMention(tag)) || []
  const isRoot = repliesTags.length === 0
  const isRootReply = repliesTags.length === 1
  const isReplyOfAReply = repliesTags.length > 1
  const rootNoteId = !isRoot ? repliesTags[0][1] : undefined
  const parentNoteId = repliesTags[repliesTags.length - 1]?.[1] || undefined
  return {
    isRoot,
    isRootReply,
    isReplyOfAReply,
    rootNoteId,
    parentNoteId,
    relayHints,
  }
}
