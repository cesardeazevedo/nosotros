import { useRootStore } from '@/hooks/useRootStore'
import { createNotificationModule } from '@/stores/modules/notification.module'

export function useNotificationModule(pubkey: string) {
  const { persistedModules } = useRootStore()
  const id = 'notification_' + pubkey
  return persistedModules.add(createNotificationModule({ id, pubkey }))
}
