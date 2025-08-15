import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { publishFollowList } from '@/nostr/publish/publishFollowList'

export function useFollowSubmit(pubkeys: string[]) {
  return usePublishEventMutation<void>({
    mutationFn:
      ({ signer, pubkey }) =>
      () =>
        publishFollowList(pubkey, 'p', pubkeys, { signer }),
  })
}
