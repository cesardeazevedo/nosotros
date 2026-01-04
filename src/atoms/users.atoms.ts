import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { replaceableEventQueryOptions } from '@/hooks/query/useQueryBase'
import { encodeSafe } from '@/utils/nip19'
import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import { nip19 } from 'nostr-tools'
import { nprofileFamily } from './nip19.atoms'

const userEventQueryFamily = atomFamily((pubkey: string | undefined) => {
  return atomWithQuery(() => replaceableEventQueryOptions(Kind.Metadata, pubkey || '', { enabled: !!pubkey }))
})

const userFollowsQueryFamily = atomFamily(
  (params: { pubkey: string | undefined; syncFollows: boolean }) => {
    const { pubkey, syncFollows } = params
    return atomWithQuery(() =>
      replaceableEventQueryOptions(Kind.Follows, pubkey || '', {
        enabled: !!pubkey && syncFollows,
      }),
    )
  },
  (a, b) => a.pubkey === b.pubkey && a.syncFollows === b.syncFollows,
)

const userMutesQueryFamily = atomFamily(
  (params: { pubkey: string | undefined; syncFollows: boolean }) => {
    const { pubkey, syncFollows } = params
    return atomWithQuery(() =>
      replaceableEventQueryOptions(Kind.Mutelist, pubkey || '', {
        enabled: !!pubkey && syncFollows,
      }),
    )
  },
  (a, b) => a.pubkey === b.pubkey && a.syncFollows === b.syncFollows,
)

export const userFamily = atomFamily(
  (params: { pubkey: string | undefined; syncFollows: boolean }) => {
    return atom((get) => {
      const { pubkey, syncFollows = false } = params
      if (!pubkey) {
        return {
          pubkey,
          event: undefined,
          follows: undefined,
          followsTag: () => false,
        }
      }

      const eventAtom = userEventQueryFamily(pubkey)
      const eventQuery = get(eventAtom)
      const event = eventQuery.data as NostrEventDB | undefined
      const metadata = event?.metadata?.userMetadata

      const displayName =
        metadata?.displayName ||
        metadata?.display_name ||
        metadata?.name ||
        encodeSafe(() => nip19.npubEncode(pubkey))?.slice(0, 12) + '...'

      const nprofile = get(nprofileFamily(pubkey))

      const followsAtom = userFollowsQueryFamily({ pubkey, syncFollows })
      const follows = get(followsAtom)
      const tags = follows.data?.tags || []

      const mutesAtom = userMutesQueryFamily({ pubkey, syncFollows })
      const mutes = get(mutesAtom)
      const muteTags = mutes.data?.tags || []
      const mutedAuthors = new Set(muteTags.filter((tag) => tag[0] === 'p').map((tag) => tag[1]))
      const mutedNotes = new Set(muteTags.filter((tag) => tag[0] === 'e').map((tag) => tag[1]))

      const followsTag = (value: string | undefined, tagName: string = 'p') => {
        return tags.some((tag) => tagName === tag[0] && tag[1] === value)
      }

      const followsAll = (values: string[], tagName: string = 'p') => {
        if (values.length === 0) return false
        return values.every((value) => tags.some((tag) => tagName === tag[0] && tag[1] === value))
      }

      return {
        pubkey,
        event,
        metadata,
        displayName,
        initials: displayName?.[0],
        canReceiveZap: !!metadata?.lud06 || !!metadata?.lud16,
        nprofile,
        totalFollowing: tags.length,
        mutedNotes,
        mutedAuthors,
        follows,
        followsTag,
        followsAll,
      }
    })
  },
  (a, b) => a.pubkey === b.pubkey && a.syncFollows === b.syncFollows,
)
