import { Divider } from '@/components/ui/Divider/Divider'
import type { NostrEventMetadata } from '@/nostr/types'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { observer } from 'mobx-react-lite'
import type { BaseSyntheticEvent } from 'react'
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { FeedNewPosts } from './FeedNewPosts'

const always = () => true

export type Props = {
  feed: FeedStore
  column?: boolean
  divider?: boolean
  renderNewPostsIndicator?: boolean
  onScrollEnd?: () => void
  filter?: (item: NostrEventMetadata) => boolean
  render: (item: NostrEventMetadata) => React.ReactNode
  wrapper?: (children: React.ReactNode) => React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const FeedList = observer(function FeedList(props: Props) {
  const { feed, render, divider = true, onScrollEnd, filter = always, column, renderNewPostsIndicator = true } = props
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!column) {
      const abort = new AbortController()
      document.addEventListener('scroll', handleWindowScroll, { signal: abort.signal })
      return () => abort.abort()
    }
  })

  const handleWindowScroll = useCallback(() => {
    const offset = document.scrollingElement?.scrollTop || 0
    if (offset >= (document.scrollingElement?.scrollHeight || Infinity) - 2000) {
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
    return feed.list.filter(filter).map((item) => (
      <React.Fragment key={item.id}>
        {render(item)}
        {divider && <Divider />}
      </React.Fragment>
    ))
  }, [feed.list, divider])

  if (column) {
    return (
      <html.div style={styles.column} ref={ref} onScroll={handleScrollColumn}>
        {props.header}
        {!props.wrapper && renderNewPostsIndicator && <FeedNewPosts ref={ref} feed={feed} />}
        {props.wrapper
          ? props.wrapper(
              <>
                {renderNewPostsIndicator && <FeedNewPosts ref={ref} feed={feed} />}
                {content}
              </>,
            )
          : content}
        {props.footer}
      </html.div>
    )
  }
  return (
    <>
      {props.header}
      <FeedNewPosts feed={feed} />
      {props.wrapper ? props.wrapper(<>{content}</>) : content}
      {props.footer}
    </>
  )
})

const styles = css.create({
  column: {
    position: 'relative',
    height: '95vh',
    overflow: 'scroll',
  },
})
