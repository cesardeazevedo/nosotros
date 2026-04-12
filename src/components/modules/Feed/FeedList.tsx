import { useRouteUtilsContext } from '@/components/providers/RouteUtilsProvider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { FeedState } from '@/hooks/state/useFeed'
import { useAtomValue } from 'jotai'
import React, { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { html } from 'react-strict-dom'
import { FeedNewPosts } from './FeedNewPosts'

type FeedListBaseItem = {
  id?: string
}

export type Props<T = NostrEventDB> = {
  feed: FeedState
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
  const { feed, render, onScrollEnd, renderNewPostsIndicator = true } = props
  const ref = useRef<HTMLDivElement>(null)
  const { hiddenRoute } = useRouteUtilsContext()

  const data = useAtomValue(feed.atoms.data)
  const baseList = useMemo(() => data?.pages.flat().slice(0, feed.pageSize) || [], [data?.pages, feed.pageSize])
  const list = props.items ?? (baseList as unknown as T[])

  const handleScroll = useCallback(() => {
    if (hiddenRoute) {
      return
    }
    const element = ref.current?.closest('section[role="region"]') as HTMLElement | null
    if (!element) {
      return
    }
    const offset = element.scrollTop
    if (offset >= (element.scrollHeight || Infinity) - 2500) {
      onScrollEnd?.()
    }
  }, [hiddenRoute, onScrollEnd])

  useLayoutEffect(() => {
    const element = ref.current?.closest('section[role="region"]') as HTMLElement | null
    if (!element) {
      return
    }
    const abort = new AbortController()
    element.addEventListener('scroll', handleScroll, { signal: abort.signal })
    return () => abort.abort()
  }, [handleScroll])

  const content = useMemo(() => {
    return list.map((item, index) => {
      const key = props.getItemKey?.(item, index) || ((item as FeedListBaseItem)?.id ?? String(index))
      return <React.Fragment key={key}>{render(item)}</React.Fragment>
    })
  }, [list, props.getItemKey, render])

  return (
    <html.div ref={ref}>
      {props.header}
      {!props.wrapper && renderNewPostsIndicator && feed.options.live !== false && (
        <FeedNewPosts ref={ref} feed={feed} />
      )}
      {props.wrapper ? (
        <>
          {props.wrapper(
            <>
              {renderNewPostsIndicator && feed.options.live !== false && <FeedNewPosts ref={ref} feed={feed} />}
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

export const FeedList = memo(FeedListBase) as <T = NostrEventDB>(props: Props<T>) => React.JSX.Element
