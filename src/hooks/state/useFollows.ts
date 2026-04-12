import { useCallback, useMemo } from 'react'
import { useUserFollows } from '../query/useQueryUser'
import { useCurrentPubkey } from '../useAuth'

export function useCurrentUserFollowsTag() {
  const currentPubkey = useCurrentPubkey()
  const follows = useUserFollows(currentPubkey, { enabled: !!currentPubkey })
  return useCallback(
    (value: string, tagName: string = 'p') => {
      return follows.data?.tags.some((tag) => tagName === tag[0] && tag[1] === value) || false
    },
    [follows.data],
  )
}

export function useCurrentUserFollowsAll(values: string[], tagName: string = 'p') {
  const currentPubkey = useCurrentPubkey()
  const follows = useUserFollows(currentPubkey, { enabled: !!currentPubkey })
  return useMemo(() => {
    if (!follows.data?.tags || values.length === 0) return false
    return values.every((value) => follows.data.tags.some((tag) => tagName === tag[0] && tag[1] === value))
  }, [follows.data, values, tagName])
}
