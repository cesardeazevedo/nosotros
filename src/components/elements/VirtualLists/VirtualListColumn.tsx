import { Divider } from '@/components/ui/Divider/Divider'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useRef } from 'react'
import type { VListHandle } from 'virtua'
import { VList } from 'virtua'
import type { FeedAbstract, VirtualListProps } from './VirtualLists.types'

export const VirtualListColumn = observer(function VirtualList<T extends FeedAbstract>(props: VirtualListProps<T>) {
  const { feed, render, divider = true, onScrollEnd, onRangeChange } = props

  const ref = useRef<VListHandle>(null)

  const handleScroll = useCallback((offset: number) => {
    if (offset >= (ref.current?.scrollSize || Infinity) - 1500 - 200) {
      onScrollEnd?.()
    }
    const start = ref.current?.findStartIndex()
    const end = ref.current?.findEndIndex()
    if (start && end) {
      onRangeChange?.(start, end)
    }
  }, [])

  return (
    <VList ref={ref} onScroll={handleScroll}>
      {props.header}
      {feed.list.map((item) => (
        <React.Fragment key={item.id}>
          {render(item)}
          {divider && <Divider />}
        </React.Fragment>
      ))}
      {props.footer}
    </VList>
  )
})
