import { HomeModuleModel } from '@/stores/home/home.module'
import { rootStore } from '@/stores/root.store'
import { fromEvent, takeUntil } from 'rxjs'

export function homeLoader(pubkey: string, signal: AbortSignal) {
  const { client } = rootStore.rootContext
  const module = HomeModuleModel.create({ pubkey })
  const { feed } = module
  if (feed!.notes.size === 0) {
    const abort$ = fromEvent(signal, 'abort')
    feed.subscribe(client).pipe(takeUntil(abort$)).subscribe()
  }
  return module
}

export function welcomeLoader(signal: AbortSignal) {
  const { welcome, rootContext } = rootStore
  if (welcome.feed.notes.size === 0) {
    const abort$ = fromEvent(signal, 'abort')
    welcome.feed.subscribe(rootContext.client).pipe(takeUntil(abort$)).subscribe()
  }
  return welcome
}
