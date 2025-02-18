import { useRootStore } from './useRootStore'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { createMediaModule } from '@/stores/modules/media.module'

export function useMediaModule() {
  const { auth, persistedModules } = useRootStore()
  const { pubkey } = auth

  return persistedModules.add(
    pubkey
      ? createMediaModule({ id: 'media', scope: 'following', authors: [pubkey] })
      : createMediaModule({ id: 'media_welcome', authors: RECOMMENDED_PUBKEYS, scope: 'self' }),
  )
}
