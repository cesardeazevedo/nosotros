import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '@/hooks/query/queryKeys'
import { eventQueryOptions, replaceableEventQueryOptions } from '@/hooks/query/useQueryBase'
import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import { selectedPubkeyAtom, signerAtom } from './auth.atoms'

const userMutesQueryFamily = atomFamily(
  (params: { pubkey: string | undefined; enabled: boolean }) => {
    const { pubkey, enabled } = params
    return atomWithQuery(() =>
      replaceableEventQueryOptions(Kind.Mutelist, pubkey || '', {
        enabled: !!pubkey && enabled,
      }),
    )
  },
  (a, b) => a.pubkey === b.pubkey && a.enabled === b.enabled,
)

const userMuteSetsQueryFamily = atomFamily(
  (params: { pubkey: string | undefined; enabled: boolean }) => {
    return atomWithQuery(() => {
      const { pubkey, enabled } = params
      return eventQueryOptions<NostrEventDB[]>({
        queryKey: queryKeys.author(pubkey || '', Kind.MuteSets),
        filter: {
          kinds: [Kind.MuteSets],
          authors: pubkey ? [pubkey] : [],
        },
        enabled: !!pubkey && enabled,
        ctx: {
          network: 'STALE_WHILE_REVALIDATE',
        },
      })
    })
  },
  (a, b) => a.pubkey === b.pubkey && a.enabled === b.enabled,
)

const parseTagListContent = (content: string): string[][] => {
  try {
    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((tag) => Array.isArray(tag)).map((tag) => tag.map((value) => String(value)))
  } catch {
    return []
  }
}

const addMuteTags = (target: Map<string, string[]>, tags: string[][]) => {
  for (const tag of tags) {
    const tagName = tag[0]
    const value = tag[1]
    if ((tagName !== 'p' && tagName !== 'e') || !value) {
      continue
    }
    target.set(`${tagName}:${value}`, [tagName, value])
  }
}

const parseEventTags = (tags: NostrEventDB['tags']): string[][] => {
  if (Array.isArray(tags)) {
    return tags as string[][]
  }
  if (typeof tags === 'string') {
    return parseTagListContent(tags)
  }
  return []
}

const userMuteSetTagsQueryFamily = atomFamily(
  (params: { event?: NostrEventDB }) => {
    return atomWithQuery((get) => {
      const { event } = params
      const signer = get(signerAtom)
      const selectedPubkey = get(selectedPubkeyAtom)
      return {
        queryKey: ['mute-set-tags', event?.id || '', event?.created_at || 0, !!signer, selectedPubkey || ''],
        enabled: !!event,
        queryFn: async () => {
          if (!event?.content || !selectedPubkey || !signer) {
            return [] as string[][]
          }
          try {
            const decrypted = await signer.decrypt(selectedPubkey, event.content)
            return parseTagListContent(decrypted)
          } catch {
            return [] as string[][]
          }
        },
      }
    })
  },
  (a, b) =>
    a.event?.id === b.event?.id &&
    a.event?.created_at === b.event?.created_at &&
    a.event?.content === b.event?.content,
)

export const userMutedStateFamily = atomFamily(
  (params: { pubkey: string | undefined; enabled: boolean }) => {
    return atom((get) => {
      const { pubkey, enabled } = params
      if (!pubkey) {
        return {
          mutedNotes: new Set<string>(),
          mutedAuthors: new Set<string>(),
        }
      }

      const mutes = get(userMutesQueryFamily({ pubkey, enabled }))
      const muteSets = get(userMuteSetsQueryFamily({ pubkey, enabled }))
      const muteSetEvents = muteSets.data || []

      // We need to handle multiple replaceable events coming from multiple relays.
      const latestByD = new Map<string, NostrEventDB>()
      for (const event of muteSetEvents) {
        const eventTags = parseEventTags(event.tags)
        const dTag = eventTags.find((tag) => tag[0] === 'd')?.[1] || event.id
        const current = latestByD.get(dTag)
        if (!current || current.created_at <= event.created_at) {
          latestByD.set(dTag, event)
        }
      }

      const mergedMuteSetTags = new Map<string, string[]>()
      for (const event of latestByD.values()) {
        addMuteTags(mergedMuteSetTags, parseEventTags(event.tags))
        const decryptedTags = get(userMuteSetTagsQueryFamily({ event })).data || []
        addMuteTags(mergedMuteSetTags, decryptedTags)
      }

      const muteTags = [...(mutes.data?.tags || []), ...mergedMuteSetTags.values()]

      return {
        mutedAuthors: new Set(muteTags.filter((tag) => tag[0] === 'p').map((tag) => tag[1])),
        mutedNotes: new Set(muteTags.filter((tag) => tag[0] === 'e').map((tag) => tag[1])),
      }
    })
  },
  (a, b) => a.pubkey === b.pubkey && a.enabled === b.enabled,
)
