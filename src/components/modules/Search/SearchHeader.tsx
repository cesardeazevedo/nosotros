import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedModule } from '@/stores/modules/feed.module'
import { spacing } from '@/themes/spacing.stylex'
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
  const onChange = useSearchChange(updateSearchParams)
  return (
    <Stack sx={styles.root} justify='space-between'>
      <SearchField
        ref={searchRef}
        placeholder='Search on nostr'
        defaultValue={module?.feed.filter.search}
        onChange={(e) => onChange(e.target.value)}
      />
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding1,
  },
})
