import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { publishFollowList } from '@/nostr/publish/publishFollowList'

export function useFollowSubmit(tag: string = 'p', pubkeys: string[]) {
  return usePublishEventMutation<void>({
    mutationFn:
      ({ signer, pubkey }) =>
      () =>
        publishFollowList(pubkey, tag, pubkeys, { signer }),
  })
}
