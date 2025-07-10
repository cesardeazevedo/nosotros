import type { FeedStore } from '@/stores/feeds/feed.store'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export function useSearchChange(updateSearchParams?: boolean, feed?: FeedStore) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(feed?.filter.search)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }
  const onSubmit = () => {
    feed?.setFilter({ ...feed.filter, search: query })
    if (updateSearchParams) {
      navigate({ to: '/search', search: { q: query } })
    }
  }

  return { query, onSubmit, onChange }
}
