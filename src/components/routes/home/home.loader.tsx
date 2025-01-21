import { rootStore } from '@/stores/root.store'

export function homeLoader() {
  const {
    home,
    rootContext: { client },
  } = rootStore
  home.subscribe(client).subscribe()
  return home
}
