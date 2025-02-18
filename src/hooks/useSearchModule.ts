import type { SearchModule } from '@/stores/modules/search.module'
import { createSearchModule } from '@/stores/modules/search.module'
import { useRootStore } from './useRootStore'

export function useSearchModule(query: string) {
  const { tempModules } = useRootStore()
  const found = tempModules.get('search') as SearchModule
  if (found) {
    found.setQuery(query)
    return found
  }
  return tempModules.add(createSearchModule({ id: 'search', query }))
}
