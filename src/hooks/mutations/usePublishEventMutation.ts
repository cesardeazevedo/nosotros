import type { Signer } from '@/core/signers/signer'
import { useMutation } from '@tanstack/react-query'
import type { NostrEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { firstValueFrom } from 'rxjs'
import invariant from 'tiny-invariant'
import { useCurrentPubkey, useCurrentSigner } from '../useAuth'

type MutationFnOptions<Vars> = {
  mutationFn: (options: { signer: Signer; pubkey: string }) => (variables: Vars) => Observable<NostrEvent>
  onSuccess?: (event: NostrEvent) => void
  onError?: (error: Error) => void
}

export function usePublishEventMutation<Vars>(options: MutationFnOptions<Vars>) {
  const signer = useCurrentSigner()
  const pubkey = useCurrentPubkey()
  return useMutation({
    mutationFn: async (variables: Vars) => {
      invariant(signer, 'Signer not found')
      invariant(pubkey, 'Not logged')
      const fn = options.mutationFn({ signer, pubkey })
      return await firstValueFrom(fn(variables))
    },
    onSuccess: (data) => {
      options.onSuccess?.(data)
    },
    onError: (error) => {
      options.onError?.(error)
    },
  })
}
