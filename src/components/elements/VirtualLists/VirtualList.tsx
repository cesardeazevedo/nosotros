import { Divider } from '@/components/ui/Divider/Divider'
import { useRangeChange } from 'hooks/useRangeChange'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useRef } from 'react'
import type { VListHandle } from 'virtua'
import { VList } from 'virtua'
import type { VirtualListProps } from './VirtualLists.types'

type Props = {
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const VirtualList = observer(function VirtualList<T extends { id: string }>(props: Props & VirtualListProps<T>) {
  const { data, render, divider = true, onScrollEnd, onRangeChange } = props

  const ref = useRef<VListHandle>(null)

  const handleScroll = useCallback((offset: number) => {
    if (offset >= (ref.current?.scrollSize || Infinity) - 1000 - 200) {
      onScrollEnd()
    }
  }, [])

  const onRangeChangeCallback = useRangeChange(onRangeChange)

  const content = useMemo(() => {
    return data?.map((item) => (
      <React.Fragment key={item.id}>
        {render(item)}
        {divider && <Divider />}
      </React.Fragment>
    ))
  }, [data])

  return (
    <VList
      ref={ref}
      style={{ height: '100%' }}
      onScroll={handleScroll}
      onRangeChange={(start, end) => onRangeChangeCallback([start, end])}>
      {props.header}
      {content}
      {props.footer}
    </VList>
  )
})
