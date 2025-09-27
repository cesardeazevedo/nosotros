import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { publishRelayList } from '@/nostr/publish/publishRelayList'
import type { UserRelay } from '@/nostr/types'

type Input = [UserRelay, boolean]

export function usePublishRelayList() {
  return usePublishEventMutation<Input>({
    mutationFn:
      ({ signer }) =>
      ([userRelay, revoke]) => {
        return publishRelayList(userRelay, revoke, { signer })
      },
  })
}
