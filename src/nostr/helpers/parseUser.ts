import { welshmanToProseMirror } from '@/utils/welshmanToProsemirror'
import { parse } from '@welshman/content'
import type { NostrEvent } from 'core/types'
import type { ContentSchema } from 'nostr-editor'
import type { Metadata } from '../types'

export type UserSchema = Partial<{
  name: string
  display_name: string
  about: string
  lud06: string
  lud16: string
  nip05: string
  nip05valid: boolean
  picture: string
  banner: string
  website: string
  aboutParsed: ContentSchema
  // invalid fields
  displayName: string
  username: string
}>

function parseUserMetadata(event: NostrEvent) {
  const parsed = JSON.parse(event.content || '{}') as UserSchema
  const { contentSchema: aboutParsed } = welshmanToProseMirror(parse({ content: parsed.about || '' }), [])
  const { displayName, username, ...rest } = parsed
  return {
    ...rest,
    name: parsed.name || username,
    display_name: parsed.display_name || displayName,
    aboutParsed,
  }
}

export function parseUser(event: NostrEvent): Metadata {
  try {
    const userMetadata = parseUserMetadata(event)
    return { userMetadata }
  } catch (error) {
    console.dir(error)
    console.log(event.content)
    return {}
  }
}
