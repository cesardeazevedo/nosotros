import { Search } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import type { BaseSyntheticEvent } from 'react'
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

  const handleChange = useCallback((e: BaseSyntheticEvent) => {
    setQuery(e.target.value)
  }, [])

  return (
    <>
      <html.div style={styles.header}>
        <Search placeholder='Search Users' onChange={handleChange} onKeyDown={handleKeydown} />
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
    padding: spacing.padding1,
  },
  content: {
    height: 'calc(100vh - 220px)',
  },
})
