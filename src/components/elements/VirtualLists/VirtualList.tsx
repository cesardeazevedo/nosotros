import { Divider } from '@/components/ui/Divider/Divider'
import { useRangeChange } from 'hooks/useRangeChange'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useRef } from 'react'
import type { FeedModule } from 'stores/modules/feed.module'
import type { VListHandle } from 'virtua'
import { VList } from 'virtua'

type Props = {
  feed: FeedModule
  render: (id: string) => React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  divider?: boolean
}

const VirtualList = observer(function VirtualList(props: Props) {
  const { feed, render, divider = true } = props

  const data = feed.list

  const ref = useRef<VListHandle>(null)

  const handleScroll = useCallback(
    (offset: number) => {
      if (offset >= (ref.current?.scrollSize || Infinity) - 1000 - 200) {
        feed.paginate()
      }
    },
    [feed],
  )

  const onRangeChange = useRangeChange(feed)

  return (
    <VList
      ref={ref}
      style={{ height: '100%' }}
      onScroll={handleScroll}
      onRangeChange={(start, end) => onRangeChange([start, end])}>
      {props.header}
      {data.map((id) => (
        <React.Fragment key={id}>
          {render(id)}
          {divider && <Divider />}
        </React.Fragment>
      ))}
      {props.footer}
    </VList>
  )
})

export default VirtualList
