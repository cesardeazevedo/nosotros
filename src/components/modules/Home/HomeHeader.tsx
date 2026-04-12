import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { FeedReplyTabs } from '../Feed/FeedReplyTabs'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'

type Props = {
  feed: FeedState
  renderEditor?: boolean
  onChangeTabs?: (tab: string | undefined) => void
  leadingPrefix?: React.ReactNode
  leading?: React.ReactNode
}

export const HomeHeader = memo(function HomeHeader(props: Props) {
  const { feed, onChangeTabs, leadingPrefix, leading = 'Feeds' } = props
  return (
    <>
      <FeedHeaderBase
        feed={feed}
        leadingPrefix={leadingPrefix}
        leading={leading}
        middle={
          <Stack sx={styles.tabs}>
            <FeedReplyTabs feed={feed} onChange={onChangeTabs} />
          </Stack>
        }
      />
    </>
  )
})

const styles = css.create({
  tabs: {
  },
})
