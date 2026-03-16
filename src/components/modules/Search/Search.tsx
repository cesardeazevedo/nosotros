import type { OnKeyDownRef, Props as SearchContentProps } from '@/components/modules/Search/SearchContent'
import { SearchContent } from '@/components/modules/Search/SearchContent'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useObservableState } from 'observable-hooks'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { css } from 'react-strict-dom'
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs'

type Props = Omit<SearchContentProps, 'query' | 'ref'> & {
  placeholder?: string
  trailing?: ReactNode
  onCancel?: () => void
}

export const Search = (props: Props) => {
  const { sx, placeholder, trailing, onCancel, onSelect, ...rest } = props
  const [query, updateQuery] = useObservableState<string, string>((input$) => {
    return input$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      startWith(''),
    )
  }, '')

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
            sx={styles.search}
            placeholder={placeholder || 'Search Users'}
            trailing={trailing}
            onKeyDown={(event) => searchRef.current?.onKeyDown({ event })}
            onCancel={() => {
              updateQuery('')
              onCancel?.()
            }}
            onChange={(e) => updateQuery(e.target.value)}
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
