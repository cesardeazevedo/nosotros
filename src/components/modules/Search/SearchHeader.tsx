import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedSearch } from '@/hooks/state/useSearchFeed'
import { memo, useActionState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  feed: FeedSearch
  onSubmit?: (search: string) => void
}

export const SearchHeader = memo(function SearchHeader(props: Props) {
  const { feed, onSubmit } = props

  const [, submit] = useActionState((_: unknown, formData: FormData) => {
    const search = formData.get('searchInput')?.toString()
    if (search) {
      feed.setFilter({ ...feed.filter, search })
      onSubmit?.(search)
    }
    return null
  }, [])

  return (
    <Stack sx={styles.root} justify='space-between'>
      <form action={submit} {...css.props(styles.form)}>
        <SearchField
          key={feed.filter.search}
          name='searchInput'
          placeholder='Search on nostr'
          autoFocus={false}
          defaultValue={feed.filter.search}
        />
      </form>
    </Stack>
  )
})

const styles = css.create({
  root: {
    height: 48,
    width: '100%',
  },
  form: {
    width: '100%',
  },
})
