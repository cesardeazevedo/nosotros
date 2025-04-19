import type { FeedStore } from '@/stores/feeds/feed.store'
import React from 'react'
import { Feed } from '../Feed/Feed'
import { FeedSettings } from '../Feed/FeedSettings'
import type { Props as DeckColumnHeaderProps } from './DeckColumnHeader'
import { DeckColumnHeader } from './DeckColumnHeader'

type Props = DeckColumnHeaderProps & {
  id: string
  feed: FeedStore
  header?: React.ReactNode
  settings?: React.ReactNode
  loading?: React.ReactNode
  wrapper?: (children: React.ReactNode) => React.ReactNode
}

export const DeckColumnFeed = (props: Props) => {
  const { id, feed, header, settings, loading, wrapper, ...rest } = props
  return (
    <>
      <DeckColumnHeader id={id} {...rest}>
        {settings ?? <FeedSettings feed={feed} />}
      </DeckColumnHeader>
      {header}
      <Feed column feed={feed} loading={loading} wrapper={wrapper} />
    </>
  )
}
