import { parseUserAbout } from 'content/parser'
import type { UserDB } from 'nostr/types'
import { nip19 } from 'nostr-tools'
import { encodeSafe } from 'utils/nip19'
import { z } from 'zod'
import type { NostrEvent } from 'core/types'

const string = z.string({ coerce: true }).catch('')
const number = z.number({ coerce: true }).catch(0)
const bool = z.boolean({ coerce: true }).catch(false)

const schema = z
  .object({
    id: string,
    name: string,
    displayName: string,
    display_name: string,
    followersCount: number,
    followingCount: number,
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
    if (input.about) {
      input.aboutParsed = parseUserAbout(input.about)
    }
    if (input.displayName || input.display_name) {
      input.displayName = input.displayName || input.display_name
    }
    return input
  })
  .readonly()

export type UserMetaData = z.infer<typeof schema>

export function parseUser(event: NostrEvent): UserDB {
  const content = JSON.parse(event.content)
  const metadata = schema.parse({ id: event.id, ...content })
  return { ...event, metadata }
}
