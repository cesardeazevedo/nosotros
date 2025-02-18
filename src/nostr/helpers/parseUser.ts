import { Kind } from '@/constants/kinds'
import type { MetadataDB } from '@/db/types'
import { welshmanToProseMirror } from '@/utils/welshmanToProsemirror'
import { parse } from '@welshman/content'
import type { NostrEvent } from 'core/types'
import { nip19 } from 'nostr-tools'
import { encodeSafe } from 'utils/nip19'
import { z } from 'zod'

const string = z.string({ coerce: true }).catch('')
const bool = z.boolean({ coerce: true }).catch(false)

export const schema = z
  .object({
    id: string,
    name: string,
    displayName: string,
    display_name: string,
    about: string,
    lud06: string,
    lud16: string,
    nip05: string,
    nip05valid: bool,
    picture: string,
    banner: string,
    website: string,
    npub: string.nullable(),
    aboutParsed: z.object({}).passthrough(),
  })
  .partial()
  .transform((input) => {
    if (input.id) {
      input.npub = encodeSafe(() => nip19.npubEncode(input.id || ''))
    }
    if (input.displayName || input.display_name) {
      input.displayName = input.displayName || input.display_name
    }
    return input
  })
  .readonly()

export type UserMetadata = MetadataDB & z.infer<typeof schema> & { kind: Kind.Metadata }

export function parseUser(event: NostrEvent): UserMetadata {
  try {
    const content = JSON.parse(event.content || '{}')
    const { contentSchema } = welshmanToProseMirror(parse({ content: content.about || '' }), [])
    const metadata = schema.parse({ id: event.id, aboutParsed: contentSchema, ...content })
    return {
      ...metadata,
      id: event.id,
      kind: Kind.Metadata,
    }
  } catch (error) {
    console.dir(error)
    return {
      id: event.id,
      kind: Kind.Metadata,
    }
  }
}
