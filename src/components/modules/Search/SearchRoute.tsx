import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { searchRoute } from '@/Router'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { FeedRoute } from '../Feed/FeedRoute'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { SearchHeader } from './SearchHeader'
import { SearchSettings } from './SearchSettings'

export const SearchRoute = memo(function SearchRoute() {
  const module = searchRoute.useLoaderData() as FeedModule
  const navigate = useNavigate()
  const feed = useFeedState(module)
  return (
    <FeedRoute
      feed={feed}
      renderEditor={false}
      bodyHeader={
        <Stack sx={styles.search} horizontal={false} justify='stretch'>
          <SearchHeader
            feed={feed}
            onSubmit={(q) => {
              navigate({
                to: '/search',
                search: (prev) => ({
                  ...prev,
                  search: q,
                }),
              })
            }}
          />
        </Stack>
      }
      sideRail={<SearchSettings feed={feed} variant='rail' />}
      header={<FeedHeaderBase feed={feed} leading='Search' renderSetting={false} />}
    />
  )
})

const styles = css.create({
  search: {
    padding: spacing.padding1,
  },
})
