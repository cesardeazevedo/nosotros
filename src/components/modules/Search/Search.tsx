import type { OnKeyDownRef, Props as SearchContentProps } from '@/components/modules/Search/SearchContent'
import { SearchContent } from '@/components/modules/Search/SearchContent'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = Omit<SearchContentProps, 'query' | 'ref'> & {
  placeholder?: string
  trailing?: ReactNode
}

export const Search = (props: Props) => {
  const { sx, placeholder, trailing, onSelect, ...rest } = props
  const [query, setQuery] = useState('')

  const searchRef = useRef<OnKeyDownRef>(null)

  return (
    <SearchContent
      ref={searchRef}
      limit={20}
      query={query}
      sx={sx}
      onSelect={onSelect}
      {...rest}
      header={
        <Stack horizontal={false} sx={styles.header}>
          <SearchField
            value={query}
            sx={styles.search}
            placeholder={placeholder || 'Search Users'}
            trailing={trailing}
            onKeyDown={(event) => searchRef.current?.onKeyDown({ event })}
            onCancel={() => setQuery('')}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Stack>
      }
    />
  )
}

const styles = css.create({
  header: {
    padding: spacing.padding1,
    width: '100%',
  },
  search: {
    backgroundColor: palette.surfaceContainer,
  },
})
