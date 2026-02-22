import { useRouteUtilsContext } from '@/components/providers/RouteUtilsProvider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { FeedState } from '@/hooks/state/useFeed'
import { useAtomValue } from 'jotai'
import type { BaseSyntheticEvent } from 'react'
import React, { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { FeedNewPosts } from './FeedNewPosts'

type FeedListBaseItem = {
  id?: string
}

export type Props<T = NostrEventDB> = {
  feed: FeedState
  column?: boolean
  renderNewPostsIndicator?: boolean
  onScrollEnd?: () => void
  render: (item: T) => React.ReactNode
  items?: T[]
  getItemKey?: (item: T, index: number) => string
  divider?: boolean
  wrapper?: (children: React.ReactNode) => React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

const FeedListBase = function FeedList<T = NostrEventDB>(props: Props<T>) {
  const { feed, render, onScrollEnd, column, renderNewPostsIndicator = true } = props
  const ref = useRef<HTMLDivElement>(null)
  const { hiddenRoute } = useRouteUtilsContext()

  const data = useAtomValue(feed.atoms.data)
  const baseList = useMemo(
    () => data?.pages.flat().slice(0, feed.pageSize) || [],
    [data?.pages, feed.pageSize],
  )
  const list = props.items ?? (baseList as unknown as T[])

  useLayoutEffect(() => {
    if (!column) {
      const abort = new AbortController()
      document.addEventListener('scroll', handleWindowScroll, { signal: abort.signal })
      return () => abort.abort()
    }
  })

  const handleWindowScroll = useCallback(() => {
    if (hiddenRoute) {
      return
    }
    const offset = document.scrollingElement?.scrollTop || 0
    if (offset >= (document.scrollingElement?.scrollHeight || Infinity) - 2100) {
      onScrollEnd?.()
    }
  }, [onScrollEnd, hiddenRoute])

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
    return list.map((item, index) => {
      const key =
        props.getItemKey?.(item, index) ||
        ((item as FeedListBaseItem)?.id ?? String(index))
      return <React.Fragment key={key}>{render(item)}</React.Fragment>
    })
  }, [list, props.getItemKey, render])

  if (column) {
    return (
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
    )
  }
  return (
    <>
      {props.header}
      {feed.options.live !== false && <FeedNewPosts feed={feed} />}
      {props.wrapper ? props.wrapper(<>{content}</>) : content}
      {props.footer}
    </>
  )
}

export const FeedList = memo(FeedListBase) as <T = NostrEventDB>(
  props: Props<T>,
) => React.JSX.Element

const styles = css.create({
  column: {
    position: 'relative',
    height: 'calc(100vh - 70px)',
    overflow: 'scroll',
  },
})
