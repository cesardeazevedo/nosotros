import { Kind } from '@/constants/kinds'
import { EMBEDDINGS_RELAYS } from '@/constants/relays'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import {
  replaceableEventQueryOptions,
  trustedAssertionsQueryOptions,
  userEmbeddingsQueryOptions,
} from '@/hooks/query/useQueryBase'
import { encodeSafe } from '@/utils/nip19'
import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import { nip19 } from 'nostr-tools'
import { userRequestDeletesQueryFamily } from './deletion.atoms'
import { userMutedStateFamily, userMutesQueryFamily } from './mutes.atoms'
import { nprofileFamily } from './nip19.atoms'

const userEventQueryFamily = atomFamily((pubkey: string | undefined) => {
  return atomWithQuery(() => replaceableEventQueryOptions(Kind.Metadata, pubkey || '', { enabled: !!pubkey }))
})

const userFollowsQueryFamily = atomFamily(
  (params: { pubkey: string | undefined; fullUserSync: boolean }) => {
    const { pubkey, fullUserSync } = params
    return atomWithQuery(() =>
      replaceableEventQueryOptions(Kind.Follows, pubkey || '', {
        enabled: !!pubkey && fullUserSync,
      }),
    )
  },
  (a, b) => a.pubkey === b.pubkey && a.fullUserSync === b.fullUserSync,
)

export const userTrustedAssertionQueryFamily = atomFamily((pubkey: string | undefined) => {
  return atomWithQuery(() =>
    trustedAssertionsQueryOptions(pubkey || '', {
      // needs to implement kind 10040 first
      enabled: false,
      ctx: {
        relays: EMBEDDINGS_RELAYS,
        outbox: false,
        negentropy: false,
      },
    }),
  )
})

export const userEmbeddingsQueryFamily = atomFamily((pubkey: string | undefined) => {
  return atomWithQuery(() =>
    userEmbeddingsQueryOptions(pubkey || '', {
      enabled: !!pubkey,
      ctx: {
        relays: EMBEDDINGS_RELAYS,
        outbox: false,
        negentropy: false,
      },
    }),
  )
})

export const userFamily = atomFamily(
  (params: { pubkey: string | undefined; fullUserSync: boolean }) => {
    return atom((get) => {
      const { pubkey, fullUserSync = false } = params
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

      const followsAtom = userFollowsQueryFamily({ pubkey, fullUserSync })
      const follows = get(followsAtom)
      const tags = follows.data?.tags || []
      const trustedAssertion = get(userTrustedAssertionQueryFamily(pubkey))
      const trustedAssertionEvent = trustedAssertion.data as NostrEventDB | undefined
      const embeddings = get(userEmbeddingsQueryFamily(pubkey))
      const mutes = get(userMutesQueryFamily({ pubkey, enabled: fullUserSync }))

      if (fullUserSync) {
        get(userRequestDeletesQueryFamily(pubkey))
      }

      const { mutedAuthors, mutedNotes } = get(userMutedStateFamily({ pubkey, enabled: fullUserSync }))

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
        trustedAssertionEvent,
        embeddings,
        totalFollowing: tags.length,
        mutedNotes,
        mutedAuthors,
        follows,
        mutes,
        followsTag,
        followsAll,
      }
    })
  },
  (a, b) => a.pubkey === b.pubkey && a.fullUserSync === b.fullUserSync,
)
