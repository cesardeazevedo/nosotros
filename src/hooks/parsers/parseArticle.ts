import { parse } from '@/utils/contentParser'
import type { NostrEvent } from 'nostr-tools'
import type { Metadata } from '../../nostr/types'
import { getMentionedAuthors } from './getMentionedAuthors'
import { getMentionedNotes } from './getMentionedNotes'
import { parseImeta } from './parseImeta'
import { parseRelayHintsFromNIP19 } from './parseRelayHints'

export function parseArticle(event: NostrEvent): Metadata {
  const { contentSchema, nprofiles, nevents, naddresses } = parse({
    content: event.content,
    tags: event.tags,
    markdown: true,
  })
  const imeta = parseImeta(event.tags)
  const mentionedNotes = getMentionedNotes(event.tags, nevents, naddresses)
  const mentionedAuthors = getMentionedAuthors(event.tags, nprofiles, nevents, naddresses)
  const relayHints = parseRelayHintsFromNIP19(nevents, nprofiles, naddresses)
  const content = {
    imeta,
    contentSchema,
    mentionedAuthors,
    mentionedNotes,
    relayHints,
  }

  return {
    isRoot: true,
    ...content,
  }
}
