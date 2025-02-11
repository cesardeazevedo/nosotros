import { useRootStore } from './useRootStore'
import { createTagModule } from '@/stores/modules/tag.module'

export function useTagModule(tag: string) {
  const { tempModules } = useRootStore()
  return tempModules.add(createTagModule([tag]))
}
