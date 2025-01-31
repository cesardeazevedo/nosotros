import { Divider } from '@/components/ui/Divider/Divider'
import type { NostrEventMetadata } from '@/nostr/types'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { observer } from 'mobx-react-lite'
import type { BaseSyntheticEvent } from 'react'
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { css, html } from 'react-strict-dom'

const always = () => true

export type Props = {
  feed: FeedStore
  column?: boolean
  divider?: boolean
  onScrollEnd?: () => void
  filter?: (item: NostrEventMetadata) => boolean
  render: (item: NostrEventMetadata) => React.ReactNode
  wrapper?: (children: React.ReactNode) => React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const List = observer(function List(props: Props) {
  const { feed, render, divider = true, onScrollEnd, filter = always, column } = props
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!column) {
      const abort = new AbortController()
      window.addEventListener('scroll', handleWindowScroll, { signal: abort.signal })
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
  }, [feed.list])

  if (column) {
    return (
      <>
        <html.div style={styles.root} ref={ref} onScroll={handleScrollColumn}>
          {props.header}
          {props.wrapper ? props.wrapper(<>{content}</>) : content}
          {props.footer}
        </html.div>
      </>
    )
  }
  return (
    <>
      {props.header}
      {props.wrapper ? props.wrapper(<>{content}</>) : content}
      {props.footer}
    </>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    height: '91vh',
    overflow: 'scroll',
  },
})
