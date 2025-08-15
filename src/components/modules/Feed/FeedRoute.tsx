import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { Divider } from '@/components/ui/Divider/Divider'
import type { FeedState } from '@/hooks/state/useFeed'
import { useResetScroll } from '@/hooks/useResetScroll'
import React, { memo } from 'react'
import { Feed } from './Feed'
import { FeedHeaderBase } from './headers/FeedHeaderBase'

type Props = {
  feed: FeedState
  header?: React.ReactNode
  headline?: React.ReactNode
  renderEditor?: boolean
}

export const FeedRoute = memo(function FeedRoute(props: Props) {
  const { feed, headline, header, renderEditor = false } = props
  useResetScroll()
  return (
    <RouteContainer headline={headline} header={header || <FeedHeaderBase feed={feed} label={'feed'} />}>
      {renderEditor && (
        <>
          {/* <Editor store={module.feed.editor} /> */}
          <Divider />
        </>
      )}
      <Feed feed={feed} />
    </RouteContainer>
  )
})
