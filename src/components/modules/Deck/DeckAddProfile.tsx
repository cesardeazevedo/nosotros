import type { SearchItem } from '@/components/modules/Search/hooks/useSearchSuggestions'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import type { BaseSyntheticEvent } from 'react'
import React, { useCallback, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { OnKeyDownRef } from '../Search/SearchContent'
import { SearchContent } from '../Search/SearchContent'

type Props = {
  onSelect: (item: SearchItem) => void
}

export const DeckAddProfile = (props: Props) => {
  const [query, setQuery] = useState('')
  const ref = useRef<OnKeyDownRef>(null)

  const handleKeydown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    ref.current?.onKeyDown({ event })
  }, [])

  const handleChange = useCallback((e: BaseSyntheticEvent) => {
    setQuery(e.target.value)
  }, [])

  return (
    <>
      <html.div style={styles.header}>
        <SearchField placeholder='Search Users' onChange={handleChange} onKeyDown={handleKeydown} />
      </html.div>
      <Stack horizontal={false} sx={styles.content}>
        <SearchContent ref={ref} query={query} limit={30} onSelect={props.onSelect} />
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
