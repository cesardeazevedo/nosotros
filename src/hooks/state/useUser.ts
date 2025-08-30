import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { encodeSafe } from '@/utils/nip19'
import { nip19 } from 'nostr-tools'
import { useCallback, useMemo } from 'react'
import type { CustomQueryOptions } from '../query/useQueryBase'
import { useEventMetadata, useUserFollows } from '../query/useQueryUser'
import { useCurrentPubkey } from '../useAuth'
import { useNprofile } from '../useEventUtils'

export type UserState = ReturnType<typeof useUserState>

type UserStateOptions = {
  syncFollows?: boolean
}

export function useUserState(pubkey?: string, options?: UserStateOptions) {
  const currentPubkey = useCurrentPubkey()
  const metadata = useUserMetadata(pubkey)

  const statsOptions = { enabled: currentPubkey === pubkey || !!options?.syncFollows }

  const nprofile = useNprofile(pubkey)
  const follows = useUserFollows(pubkey, statsOptions)

  const totalFollowing = useMemo(() => follows.data?.tags.length || 0, [follows.data])

  const followsTag = useCallback(
    (otherPubkey: string | undefined, tagName: string = 'p') => {
      return follows.data?.tags.some((tag) => tagName === tag[0] && tag[1] === otherPubkey) || false
    },
    [follows.data],
  )

  return {
    ...metadata,
    follows,
    nprofile,
    relays: [],
    mutedNotes: new Set(),
    mutedAuthors: new Set(),
    followsTag,
    totalFollowing,
  }
}

export function useUserMetadata(pubkey?: string, options?: CustomQueryOptions<NostrEventDB>) {
  const user = useEventMetadata(pubkey, options)
  const event = user.data
  const metadata = event?.metadata?.userMetadata
  const displayName =
    metadata?.displayName ||
    metadata?.display_name ||
    metadata?.name ||
    encodeSafe(() => nip19.npubEncode(pubkey || ''))?.slice(0, 12) + '...'

  const initials = displayName?.[0]
  return {
    event,
    pubkey,
    metadata,
    displayName,
    initials,
    canReceiveZap: !!metadata?.lud06 || !!metadata?.lud16,
  }
}
