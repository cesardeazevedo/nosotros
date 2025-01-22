import { Divider } from '@/components/ui/Divider/Divider'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useRef } from 'react'
import type { VListHandle } from 'virtua'
import { VList } from 'virtua'
import type { FeedAbstract, VirtualListProps } from './VirtualLists.types'

const always = () => true

export const VirtualListColumn = observer(function VirtualList<T extends FeedAbstract>(props: VirtualListProps<T>) {
  const { feed, render, divider = true, onScrollEnd, filter = always } = props

  const ref = useRef<VListHandle>(null)

  const handleScroll = useCallback((offset: number) => {
    if (offset >= (ref.current?.scrollSize || Infinity) - 2500) {
      onScrollEnd?.()
    }
  }, [])

  const content = useMemo(() => {
    return feed.list.filter(filter).map((item) => (
      <React.Fragment key={item.id}>
        {render(item)}
        {divider && <Divider />}
      </React.Fragment>
    ))
  }, [feed.list])

  return (
    <VList ref={ref} onScroll={handleScroll}>
      {props.header}
      {props.wrapper ? props.wrapper(<>{content}</>) : content}
      {props.footer}
    </VList>
  )
})
