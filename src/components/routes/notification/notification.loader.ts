import { deckStore } from '@/stores/ui/deck.store'

export function notificationLoader() {
  return deckStore.notification?.start().subscribe()
}
