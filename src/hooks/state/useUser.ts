import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { encodeSafe } from '@/utils/nip19'
import { nip19 } from 'nostr-tools'
import { useCallback, useMemo } from 'react'
import type { CustomQueryOptions } from '../query/useQueryBase'
import { useEventMetadata, useUserFollows } from '../query/useQueryUser'
import { useCurrentPubkey } from '../useAuth'
import { useNprofile } from '../useEventUtils'

export type UserState = ReturnType<typeof useUserState>

export function useUserState(pubkey?: string) {
  const currentPubkey = useCurrentPubkey()
  const metadata = useUserMetadata(pubkey)

  const statsOptions = { enabled: currentPubkey === pubkey }

  const nprofile = useNprofile(pubkey)
  const follows = useUserFollows(pubkey, statsOptions)

  const totalFollows = useMemo(() => follows.data?.tags.filter((tag) => tag[0] === 'p').length || 0, [follows.data])

  const followsPubkey = useCallback(
    (otherPubkey?: string) => {
      return follows.data?.tags.some((tag) => tag[1] === otherPubkey) || false
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
    followsPubkey,
    totalFollows,
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
