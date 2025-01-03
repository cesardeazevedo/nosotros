import { Divider } from '@/components/ui/Divider/Divider'
import { observer } from 'mobx-react-lite'
import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { WindowVirtualizer, type CacheSnapshot, type WindowVirtualizerHandle } from 'virtua'
import type { FeedAbstract, VirtualListProps } from './VirtualLists.types'

export const VirtualListWindow = observer(function VirtualListWindow<T extends FeedAbstract>(
  props: VirtualListProps<T>,
) {
  const { id, render, feed, divider = true, onScrollEnd, onRangeChange } = props
  const cacheKey = `window-list-cache-${id}`

  const ref = useRef<WindowVirtualizerHandle>(null)

  const [offset, cache] = useMemo(() => {
    const serialized = sessionStorage.getItem(cacheKey)
    if (!serialized) return []
    try {
      return JSON.parse(serialized) as [number, CacheSnapshot]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return []
    }
  }, [cacheKey])

  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }
    const handle = ref.current

    window.scrollTo(0, offset ?? 0)

    const onScroll = () => {
      const scrolledTo = window.scrollY + window.innerHeight
      if (scrolledTo >= document.body.scrollHeight - 250) {
        onScrollEnd?.()
      }
    }

    const onUnload = () => {
      sessionStorage.setItem(cacheKey, JSON.stringify([window.scrollY, handle.cache]))
    }

    window.addEventListener('scroll', onScroll)
    window.addEventListener('beforeunload', onUnload)
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('beforeunload', onUnload)
      sessionStorage.setItem(cacheKey, JSON.stringify([window.scrollY, handle.cache]))
    }
  }, [cacheKey, offset])

  return (
    <>
      {props.header}
      <WindowVirtualizer ref={ref} overscan={4} cache={cache} onRangeChange={onRangeChange}>
        {feed.list.map((item) => (
          <React.Fragment key={item.id}>
            {render(item)}
            {divider && <Divider />}
          </React.Fragment>
        ))}
      </WindowVirtualizer>
      {props.footer}
    </>
  )
})
