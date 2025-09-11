import { useCurrentPubkey, useCurrentSigner } from '../useAuth'

export function usePublishOptions() {
  const signer = useCurrentSigner()
  const pubkey = useCurrentPubkey()
  return { signer, pubkey }
}
