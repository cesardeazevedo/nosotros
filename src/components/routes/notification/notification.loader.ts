import { NotificationModuleModel } from '@/stores/notifications/notification.module'
import { rootStore } from '@/stores/root.store'

export function notificationLoader(props: { pubkey: string }) {
  const { client } = rootStore.rootContext
  const module = NotificationModuleModel.create({
    id: 'notification',
    pubkey: props.pubkey,
  })
  if (module.feed.notes.size === 0) {
    module.feed.subscribe(client).subscribe()
  }
  return module
}
