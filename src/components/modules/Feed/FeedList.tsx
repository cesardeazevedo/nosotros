import { PullToRefresh } from '@/components/elements/PullToRefresh/PullToRefresh'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import type { BaseSyntheticEvent } from 'react'
import React, { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { FeedNewPosts } from './FeedNewPosts'

export type Props = {
  feed: FeedState
  column?: boolean
  renderNewPostsIndicator?: boolean
  onScrollEnd?: () => void
  render: (item: NostrEventDB) => React.ReactNode
  wrapper?: (children: React.ReactNode) => React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const FeedList = memo(function FeedList(props: Props) {
  const { feed, render, onScrollEnd, column, renderNewPostsIndicator = true } = props
  const ref = useRef<HTMLDivElement>(null)
  const pullRefreshProps = {
    onRefresh: feed.onRefresh,
  }

  const list = useMemo(
    () => feed.query.data?.pages.flat().slice(0, feed.pageSize) || [],
    [feed.query.data?.pages, feed.pageSize],
  )

  useLayoutEffect(() => {
    if (!column) {
      const abort = new AbortController()
      document.addEventListener('scroll', handleWindowScroll, { signal: abort.signal })
      return () => abort.abort()
    }
  })

  const handleWindowScroll = useCallback(() => {
    const offset = document.scrollingElement?.scrollTop || 0
    if (offset >= (document.scrollingElement?.scrollHeight || Infinity) - 2100) {
      onScrollEnd?.()
    }
  }, [onScrollEnd])

  const handleScrollColumn = useCallback(
    (e: BaseSyntheticEvent) => {
      const offset = e.target.scrollTop
      if (offset >= (e.target.scrollHeight || Infinity) - 2500) {
        onScrollEnd?.()
      }
    },
    [onScrollEnd],
  )

  const content = useMemo(() => {
    return list.map((item) => <React.Fragment key={item.id}>{render(item)}</React.Fragment>)
  }, [list, render])

  if (column) {
    return (
      <PullToRefresh {...pullRefreshProps}>
        <html.div style={styles.column} ref={ref} onScroll={handleScrollColumn}>
          {props.header}
          {!props.wrapper && renderNewPostsIndicator && <FeedNewPosts ref={ref} feed={feed} />}
          {props.wrapper ? (
            <>
              {props.wrapper(
                <>
                  {renderNewPostsIndicator && <FeedNewPosts ref={ref} feed={feed} />}
                  {content}
                </>,
              )}
            </>
          ) : (
            content
          )}
          {props.footer}
        </html.div>
      </PullToRefresh>
    )
  }
  return (
    <PullToRefresh {...pullRefreshProps}>
      {props.header}
      <FeedNewPosts feed={feed} />
      {props.wrapper ? props.wrapper(<>{content}</>) : content}
      {props.footer}
    </PullToRefresh>
  )
})

const styles = css.create({
  column: {
    position: 'relative',
    height: 'calc(100vh - 70px)',
    overflow: 'scroll',
  },
  refreshing: {
    paddingBlock: spacing.padding2,
  },
})
