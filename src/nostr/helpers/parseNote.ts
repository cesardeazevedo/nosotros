import { Kind } from '@/constants/kinds'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import type { MetadataDB } from '@/db/types'
import { parseHintsFromNIP19 } from '@/nostr/helpers/getHintsFromNIP19'
import { parseNoteContent } from '@/nostr/helpers/parseNoteContent'
import type { ParsedTags } from '@/nostr/helpers/parseTags'
import { isMention, parseTags } from '@/nostr/helpers/parseTags'
import type { NostrEvent, RelayHints } from 'core/types'
import type { ContentSchema, IMetaTags } from 'nostr-editor'
import { getMentionedAuthors } from 'nostr/helpers/getMentionedAuthors'
import { getMentionedNotes } from 'nostr/helpers/getMentionedNotes'

export interface NoteMetadata extends MetadataDB {
  kind: Kind.Text | Kind.Article
  contentSchema: ContentSchema
  imeta: IMetaTags
  mentionedAuthors: string[]
  mentionedNotes: string[]
  tags: ParsedTags
  relayHints: Partial<RelayHints>
  isRoot: boolean
  isRootReply: boolean
  isReplyOfAReply: boolean
  rootNoteId: string | undefined
  parentNoteId: string | undefined
  lastSyncedAt: number | undefined
}

export function parseNote(event: NostrEvent): NoteMetadata {
  const { contentSchema, imeta, nevents, nprofiles, naddress } = parseNoteContent(event)
  const { hints = {}, ...tags } = parseTags(event.tags)

  const repliesTags = tags.e?.filter((tag) => !isMention(tag)) || []

  const mentionedNotes = getMentionedNotes(tags, nevents, naddress)
  const mentionedAuthors = getMentionedAuthors(tags, nprofiles, nevents, naddress)
  const relayHints = mergeRelayHints([hints, parseHintsFromNIP19(nevents, nprofiles, naddress)])

  const isRoot = repliesTags.length === 0
  const isRootReply = repliesTags.length === 1
  const isReplyOfAReply = repliesTags.length > 1
  const rootNoteId = !isRoot ? repliesTags[0][1] : undefined
  const parentNoteId = repliesTags[repliesTags.length - 1]?.[1] || undefined

  return {
    id: event.id,
    kind: Kind.Text,
    imeta,
    contentSchema,
    relayHints,
    mentionedNotes,
    mentionedAuthors,
    tags,
    rootNoteId,
    parentNoteId,
    isRoot,
    isRootReply,
    isReplyOfAReply,
    lastSyncedAt: 0,
  }
}
