import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import type { NostrEvent, RelayHints } from '@/core/types'
import { welshmanToProseMirror } from '@/utils/welshmanToProsemirror'
import { parse } from '@welshman/content'
import type { Metadata } from '../../nostr/types'
import { getMentionedAuthors } from './getMentionedAuthors'
import { getMentionedNotes } from './getMentionedNotes'
import { parseImeta } from './parseImeta'
import { parseRelayHintsFromNIP19 } from './parseRelayHints'

export function parseContent(event: NostrEvent): Metadata {
  const imeta = parseImeta(event.tags)
  const parsed = parse({ content: event.content, tags: event.tags })
  const { contentSchema, nprofiles, nevents, naddresses } = welshmanToProseMirror(parsed)

  const relayHints = parseRelayHintsFromNIP19(nevents, nprofiles, naddresses)
  const mentionedNotes = getMentionedNotes(event.tags, nevents, naddresses)
  const mentionedAuthors = getMentionedAuthors(event.tags, nprofiles, nevents, naddresses)

  return {
    imeta,
    contentSchema,
    mentionedNotes,
    mentionedAuthors,
    relayHints: mergeRelayHints([
      relayHints,
      mentionedNotes.reduce(
        (acc, prev) => ({
          idHints: {
            ...acc.idHints,
            [prev]: [event.pubkey],
          },
        }),
        { idHints: {} } as RelayHints,
      ),
    ]),
  }
}
