import type { Kind } from '@/constants/kinds'
import type { RelayHints } from '@/core/types'
import type { MetadataDB } from '@/db/types'
import type { NostrEvent } from 'nostr-tools'
import type { ContentMetadata } from './parseContent'
import { parseContent } from './parseContent'
import type { ParsedTags } from './parseTags'
import { parseTags } from './parseTags'

export type CommentMetadata = MetadataDB &
  ContentMetadata & {
    kind: Kind.Comment
    rootKind: string | undefined
    rootId: string | undefined
    tags: ParsedTags
    isRoot: false // Just to be compatible with NoteMetadata
    parentKind: string | undefined
    parentId: string | undefined
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

export function parseComment(event: NostrEvent): CommentMetadata {
  const tags = parseTags(event.tags)
  const content = parseContent(event, tags)
  const relayHints = parseCommentHints(tags)
  const rootTag = tags.E ? 'E' : tags.A ? 'A' : tags.I ? 'I' : ''
  const rootId = tags[rootTag]?.[0]?.[1]
  const rootKind = tags.K?.[0]?.[1]
  const parentId = tags[rootTag.toLowerCase()]?.[0]?.[1]
  const parentKind = tags.k?.[0]?.[1]

  return {
    ...content,
    id: event.id,
    kind: event.kind,
    isRoot: false,
    tags,
    rootKind,
    rootId,
    parentId,
    parentKind,
    relayHints,
  }
}
