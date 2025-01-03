import { parseUserAbout } from '@/nostr/helpers/parseNotes'
import type { UserMetadataDB } from '@/nostr/types'
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

export type UserMetadata = z.infer<typeof schema>

export function parseUser(event: NostrEvent): UserMetadataDB {
  try {
    const content = JSON.parse(event.content || '{}')
    const aboutParsed = parseUserAbout(event)
    const metadata = schema.parse({ id: event.id, aboutParsed, ...content })
    return {
      ...metadata,
      id: event.id,
      kind: event.kind,
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      id: event.id,
      kind: event.kind,
    }
  }
}
