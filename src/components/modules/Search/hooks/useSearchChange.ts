import { useNavigate } from '@tanstack/react-router'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { tap, throttleTime } from 'rxjs'

export function useSearchChange(updateSearchParams?: boolean) {
  const navigate = useNavigate()
  const [onChange, query$] = useObservableCallback<string>((input$) => {
    return input$.pipe(
      throttleTime(1300, undefined, { leading: false, trailing: true }),
      tap((query) => updateSearchParams && navigate({ to: '/search', search: { q: query } })),
    )
  })
  useSubscription(query$)
  return onChange
}
