import { createSearchModule } from '@/stores/modules/search.module'
import { useRootStore } from './useRootStore'

export function useSearchModule(query: string) {
  const { tempModules } = useRootStore()
  return tempModules.add(createSearchModule({ id: 'search', query }))
}
