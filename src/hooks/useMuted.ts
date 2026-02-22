import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useUserState } from '@/hooks/state/useUser'
import { useCurrentPubkey } from '@/hooks/useAuth'

export function useMuted(event: NostrEventDB) {
  const currentPubkey = useCurrentPubkey()
  const currentUser = useUserState(currentPubkey, { fullUserSync: true })

  const isMutedAuthor =
    !!currentPubkey &&
    currentPubkey !== event.pubkey &&
    !!currentUser.mutedAuthors?.has(event.pubkey)
  const isMutedNote = !!currentPubkey && !!currentUser.mutedNotes?.has(event.id)

  return {
    isMuted: isMutedAuthor || isMutedNote,
    isMutedAuthor,
    isMutedNote,
  }
}
