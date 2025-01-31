import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { useRootStore } from '@/hooks/useRootStore'
import { createHome } from '@/stores/home/home.module'

export function useHomeModule() {
  const { auth, persistedModules } = useRootStore()
  const { pubkey } = auth

  return persistedModules.add(
    pubkey
      ? createHome({ id: 'home', authors: [pubkey] })
      : createHome({ id: 'welcome', authors: RECOMMENDED_PUBKEYS, scope: 'self' }),
  )
}
