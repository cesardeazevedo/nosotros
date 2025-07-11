import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedModule } from '@/stores/modules/feed.module'
import { useRef } from 'react'
import { css } from 'react-strict-dom'
import { useSearchChange } from './hooks/useSearchChange'

type Props = {
  module?: FeedModule
  updateSearchParams?: boolean
}

export const SearchHeader = (props: Props) => {
  const { module, updateSearchParams = true } = props
  const searchRef = useRef<HTMLInputElement>(null)
  const { query, onSubmit, onChange } = useSearchChange(updateSearchParams, module?.feed)
  return (
    <Stack sx={styles.root} justify='space-between'>
      <form action={onSubmit} {...css.props(styles.form)}>
        <SearchField ref={searchRef} placeholder='Search on nostr' defaultValue={query} onChange={onChange} />
      </form>
    </Stack>
  )
}

const styles = css.create({
  root: {
    height: 48,
    width: '100%',
  },
  form: {
    width: '100%',
  },
})
