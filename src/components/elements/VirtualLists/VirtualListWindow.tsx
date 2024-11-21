import { Divider } from '@/components/ui/Divider/Divider'
import { useRangeChange } from 'hooks/useRangeChange'
import { observer } from 'mobx-react-lite'
import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { WindowVirtualizer, type CacheSnapshot, type WindowVirtualizerHandle } from 'virtua'
import type { VirtualListProps } from './VirtualLists.types'

export const VirtualListWindow = observer(function VirtualListWindow<T extends { id: string }>(
  props: VirtualListProps<T>,
) {
  const { id, render, data, divider = true, onScrollEnd, onRangeChange } = props
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
      if (scrolledTo >= document.body.scrollHeight - 200) {
        onScrollEnd()
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

  const onRangeChangeCallback = useRangeChange(onRangeChange)

  const content = useMemo(() => {
    return data?.map((item) => (
      <React.Fragment key={item.id}>
        {render(item)}
        {divider && <Divider />}
      </React.Fragment>
    ))
  }, [data, divider])

  return (
    <>
      <WindowVirtualizer
        ref={ref}
        overscan={4}
        cache={cache}
        onRangeChange={(start, end) => onRangeChange && onRangeChangeCallback([start, end])}>
        {content}
      </WindowVirtualizer>
    </>
  )
})
