import { Stack } from '@/components/ui/Stack/Stack'
import { useSearchFeed } from '@/hooks/state/useSearchFeed'
import { useResetScroll } from '@/hooks/useResetScroll'
import { searchRoute } from '@/Router'
import { spacing } from '@/themes/spacing.stylex'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { FeedRoute } from '../Feed/FeedRoute'
import { SearchHeader } from './SearchHeader'
import { SearchSettings } from './SearchSettings'

export const SearchRoute = memo(function SearchRoute() {
  useResetScroll()
  const { q } = searchRoute.useSearch()
  const navigate = useNavigate()
  const feed = useSearchFeed(q)
  return (
    <FeedRoute
      feed={feed}
      renderEditor={false}
      header={
        <>
          <Stack sx={styles.header} horizontal={false} justify='stretch'>
            <SearchHeader
              feed={feed}
              onSubmit={(q) => {
                navigate({ to: '/search', search: { q } })
              }}
            />
          </Stack>
          <SearchSettings feed={feed} />
        </>
      }
    />
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding1,
  },
})
