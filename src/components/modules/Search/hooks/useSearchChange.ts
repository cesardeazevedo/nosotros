import { useState } from 'react'

export function useSearchChange(search: string) {
  const [query, setQuery] = useState(search)
  // const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setQuery(e.target.value)
  // }
  // const onSubmit = () => {
  //   feed?.setFilter({ ...feed.filter, search: query })
  //   // if (updateSearchParams) {
  //     // navigate({ to: '/search', search: { q: query } })
  //   // }
  // }

  return { query }
}
