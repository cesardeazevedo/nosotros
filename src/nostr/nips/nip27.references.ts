// Adapted from nostr-tools/src/references.ts
import type { NostrEvent } from 'core/types'
import { nip19 } from 'nostr-tools'
import type { AddressPointer, EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19'

type BaseReference = {
  index: number
  text: string
  author?: string
}

export type EventReference = BaseReference & { prefix: 'nevent' | 'note'; event: EventPointer }
export type ProfileReference = BaseReference & { prefix: 'nprofile' | 'npub'; profile: ProfilePointer }
type AddressReference = BaseReference & { prefix: 'naddr'; address: AddressPointer }

export type NostrReference = ProfileReference | EventReference | AddressReference

const mentionRegex = /\bnostr:((note|npub|naddr|nevent|nprofile)1\w+)\b|#\[(\d+)\]/g

const { decode } = nip19

export function parseReferences(evt: Partial<NostrEvent>): NostrReference[] {
  const references: NostrReference[] = []
  for (const ref of evt.content?.matchAll?.(mentionRegex) || []) {
    const index = ref.index || 0
    if (ref[2]) {
      // it's a NIP-27 mention
      try {
        const { type, data } = decode(ref[1])
        switch (type) {
          case 'npub': {
            references.push({
              index,
              prefix: 'npub',
              text: ref[0],
              profile: { pubkey: data as string, relays: [] },
              author: data as string,
            })
            break
          }
          case 'nprofile': {
            references.push({
              index,
              prefix: 'nprofile',
              text: ref[0],
              profile: data as ProfilePointer,
              author: data.pubkey,
            })
            break
          }
          case 'note': {
            references.push({
              index,
              prefix: 'note',
              text: ref[0],
              event: { id: data as string, relays: [] },
            })
            break
          }
          case 'nevent': {
            references.push({
              index,
              prefix: 'nevent',
              text: ref[0],
              event: data as EventPointer,
              author: data.author,
            })
            break
          }
          case 'naddr': {
            references.push({
              index,
              prefix: 'naddr',
              text: ref[0],
              address: data as AddressPointer,
              author: data.pubkey,
            })
            break
          }
        }
      } catch (err) {
        /***/
      }
    } else if (ref[3]) {
      // it's a NIP-10 mention
      const idx = parseInt(ref[3], 10)
      const tag = evt.tags?.[idx]
      if (!tag) continue

      switch (tag[0]) {
        case 'p': {
          references.push({
            index,
            prefix: 'nprofile',
            text: ref[0],
            profile: { pubkey: tag[1], relays: tag[2] ? [tag[2]] : [] },
            author: tag[1],
          })
          break
        }
        case 'e': {
          references.push({
            index,
            prefix: 'nevent',
            text: ref[0],
            event: { id: tag[1], relays: tag[2] ? [tag[2]] : [] },
          })
          break
        }
        case 'a': {
          try {
            const [kind, pubkey, identifier] = tag[1].split(':')
            references.push({
              index,
              prefix: 'naddr',
              text: ref[0],
              address: {
                identifier,
                pubkey,
                kind: parseInt(kind, 10),
                relays: tag[2] ? [tag[2]] : [],
              },
              author: pubkey,
            })
          } catch (err) {
            /***/
          }
          break
        }
      }
    }
  }

  return references
}

