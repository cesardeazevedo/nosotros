import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedStore } from '@/stores/feeds/feed.store'
import React from 'react'
import { Feed } from '../Feed/Feed'

type Props = {
  feed: FeedStore
  header?: React.ReactNode
  settings?: React.ReactNode
  loading?: React.ReactNode
  wrapper?: (children: React.ReactNode) => React.ReactNode
  renderDivider?: boolean
}

export const DeckColumnFeed = (props: Props) => {
  const { feed, header, loading, wrapper, renderDivider = true } = props
  return (
    <Stack horizontal={false}>
      {header}
      {renderDivider && <Divider />}
      <Feed column feed={feed} loading={loading} wrapper={wrapper} />
    </Stack>
  )
}
