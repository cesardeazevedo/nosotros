import type { FeedStore } from '@/stores/feeds/feed.store'
import { useNavigate } from '@tanstack/react-router'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { tap, throttleTime } from 'rxjs'

export function useSearchChange(updateSearchParams?: boolean, feed?: FeedStore) {
  const navigate = useNavigate()
  const [onChange, query$] = useObservableCallback<string>((input$) => {
    return input$.pipe(
      throttleTime(1300, undefined, { leading: false, trailing: true }),
      tap((query) => {
        if (updateSearchParams) {
          navigate({ to: '/search', search: { q: query } })
        }
        if (feed) {
          feed.setFilter({ ...feed.filter, search: query })
        }
      }),
    )
  })
  useSubscription(query$)
  return onChange
}
