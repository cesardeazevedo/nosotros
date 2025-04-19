import type { RelayHints } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import type { Metadata } from '../types'
import { parseContent } from './parseContent'
import type { ParsedTags } from './parseTags'
import { parseTags } from './parseTags'

function appendHint(hints: RelayHints, field: keyof RelayHints, key: string, value: string) {
  if (value) {
    hints[field] ??= {}
    hints[field][key] ??= []
    if (hints[field][key].indexOf(value) === -1) {
      hints[field][key].push(value)
    }
  }
}

function parseCommentHints(tags: ParsedTags) {
  const hints = {} as RelayHints
  Object.values(tags)
    .flat()
    .forEach((tag) => {
      if (tag) {
        const [name, value, relay, pubkey] = tag
        switch (name) {
          case 'P':
          case 'p': {
            appendHint(hints, 'authors', value, relay)
            break
          }
          case 'E':
          case 'e': {
            appendHint(hints, 'ids', value, relay)
            if (pubkey) {
              appendHint(hints, 'idHints', value, pubkey)
            }
            break
          }
          case 'q': {
            appendHint(hints, 'ids', value, relay)
            if (pubkey) {
              appendHint(hints, 'idHints', value, pubkey)
            }
            break
          }
        }
      }
    })
  return hints
}

export function parseComment(event: NostrEvent): Metadata {
  const tags = parseTags(event.tags)
  const content = parseContent(event, tags)
  const relayHints = parseCommentHints(tags)
  const rootTag = tags.E ? 'E' : tags.A ? 'A' : tags.I ? 'I' : ''
  const rootId = tags[rootTag]?.[0]?.[1]
  const parentId = tags[rootTag.toLowerCase()]?.[0]?.[1]

  return {
    ...content,
    isRoot: false,
    tags,
    rootId,
    parentId,
    relayHints,
  }
}
