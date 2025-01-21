import { Kind } from '@/constants/kinds'
import type { MetadataDB } from '@/db/types'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import type { NostrEvent } from 'core/types'
import type { ContentSchema } from 'nostr-editor'
import { NEventExtension, NostrExtension } from 'nostr-editor'
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

const editor = new Editor({
  extensions: [
    StarterKit.configure({ history: false }),
    NostrExtension.configure({
      image: false,
      video: false,
      nevent: false,
      youtube: false,
      tweet: false,
      nsecReject: false,
    }),
    NEventExtension.extend({
      inline: true,
      group: 'inline',
    }),
  ],
})

export function parseUserAbout(event: NostrEvent): ContentSchema {
  editor.commands.setEventContentKind0(event)
  return editor.getJSON() as ContentSchema
}

export function parseUser(event: NostrEvent): UserMetadata {
  try {
    const content = JSON.parse(event.content || '{}')
    const aboutParsed = parseUserAbout(event)
    const metadata = schema.parse({ id: event.id, aboutParsed, ...content })
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
