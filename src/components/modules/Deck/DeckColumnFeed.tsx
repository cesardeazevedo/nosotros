import { Divider } from '@/components/ui/Divider/Divider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { FeedState } from '@/hooks/state/useFeed'
import React, { memo } from 'react'
import { Feed } from '../Feed/Feed'
import { DeckScroll } from './DeckScroll'

type Props = {
  feed: FeedState
  header?: React.ReactNode
  settings?: React.ReactNode
  loading?: React.ReactNode
  wrapper?: (children: React.ReactNode) => React.ReactNode
  render?: (event: NostrEventDB) => React.ReactNode
  renderDivider?: boolean
}

export const DeckColumnFeed = memo(function DeckColumnFeed(props: Props) {
  const { feed, header, loading, wrapper, renderDivider = true, render } = props
  return (
    <DeckScroll>
      {header}
      {renderDivider && <Divider />}
      <Feed column feed={feed} loading={loading} wrapper={wrapper} render={render} />
    </DeckScroll>
  )
})
