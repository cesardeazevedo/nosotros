import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconSearch } from '@tabler/icons-react'
import { useCallback, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { SearchUsersRef } from '../Search/SearchUsers'
import { SearchUsers } from '../Search/SearchUsers'

type Props = {
  onSelect: (item: { pubkey: string }) => void
}

export const DeckAddProfile = (props: Props) => {
  const [query, setQuery] = useState('')
  const ref = useRef<SearchUsersRef>(null)

  const handleKeydown = useCallback((event: { key: string }) => {
    ref.current?.onKeyDown({ event })
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  return (
    <>
      <html.div style={styles.header}>
        <Stack sx={styles.search} gap={1}>
          <IconSearch size={20} style={{ opacity: 0.5 }} />
          <html.input
            autoFocus
            style={styles.input}
            type='text'
            placeholder='Search users'
            onChange={handleChange}
            onKeyDown={handleKeydown}
          />
        </Stack>
      </html.div>
      <Stack horizontal={false} sx={styles.content}>
        <SearchUsers
          ref={ref}
          elevation={0}
          surface='surfaceContainerLowest'
          query={query}
          limit={30}
          onSelect={props.onSelect}
        />
      </Stack>
    </>
  )
}

const styles = css.create({
  header: {
    paddingInline: spacing.padding1,
  },
  search: {
    paddingInline: spacing.padding2,
    backgroundColor: palette.surfaceContainerHigh,
    borderRadius: shape.full,
    fontSize: typeScale.bodySize$lg,
  },
  input: {
    border: 'none',
    paddingBlock: spacing.padding1,
    width: '100%',
    height: '100%',
  },
  content: {
    height: 'calc(100vh - 220px)',
  },
})
