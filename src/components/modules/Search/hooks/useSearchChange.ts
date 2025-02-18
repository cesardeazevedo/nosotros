import type { SearchModule } from '@/stores/modules/search.module'
import { useNavigate } from '@tanstack/react-router'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { throttleTime, tap } from 'rxjs'

export function useSearchChange(module: SearchModule, updateSearchParams?: boolean) {
  const navigate = useNavigate()
  const [onChange, query$] = useObservableCallback<string>((input$) => {
    return input$.pipe(
      throttleTime(1300, undefined, { leading: false, trailing: true }),
      tap((query) => updateSearchParams && navigate({ to: '/search', search: { q: query } })),
      tap((query) => module.setQuery(query)),
    )
  })
  useSubscription(query$)
  return onChange
}
